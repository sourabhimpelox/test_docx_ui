import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "../../pdfmake/custom-fonts.js";
import * as _ from "lodash";
import { SessionService } from "src/app/session-service/session.service";
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import { CommonService } from "src/app/shared/common.service";
import { environment } from "@environment/environment";
import { DistributorV1Service } from "src/app/distributo-v1/service/distributor-v1.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { formatNumber } from "@angular/common";
// import { pdfImages } from "../../pdf/pdf-images.js";
import * as moment from "moment";
import { API_ENDPOINTS_DISTRIBUTOR } from "src/assets/data-variable/api-constant";
import { PdfService } from "src/app/shared/pdf.service";
import { pdfImages } from "./orient-images";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
pdfMake.fonts = {
  Calibri: {
    normal: "Calibri-Regular.ttf",
    bold: "Calibri-Bold.TTF",
  },
  Roboto: {
    normal: "Roboto-Regular.ttf",
    bold: "Roboto-Medium.ttf",
    italics: "Roboto-Italic.ttf",
    bolditalics: "Roboto-Italic.ttf",
  },
};

@Component({
  selector: "app-quote-pdf",
  templateUrl: "./orient-pdf.component.html",
  styleUrls: ["./orient-pdf.component.scss"],
})
export class OrientPdfComponent implements OnInit {
  public CRN: any;
  public role: string;
  public url = environment.apiUrl;
  public insurerUrl: string;
  public census: any[] = [];
  public transformedResultResponse: any;
  public category: any;
  public sendVisible: string;
  public highRiskMafAge: string;
  public totalMembers = 0;
  public categoryCount = [];
  public optionsPremium: any[];
  public premiumDetails: any[];
  public premiumForOption: any[] = [];
  public redirectionUrl: string;
  public todaydate: any;
  public quoteGeneratedDate: string;
  public benefitHeadersWithGroup: any[];
  public exclusions: any;
  public policyHolder: string
  public quotationNumber: string

  constructor(private activeRoute: ActivatedRoute, private pdfService: PdfService, private modalServices: NgbModal, private distributorV1Service: DistributorV1Service, private commonService: CommonService, private spinner: NgxSpinnerService, private sessionservice: SessionService, private toasterService: ToastrService, private router: Router) { }

  async ngOnInit(): Promise<void> {
    try {
      this.spinner.show();
      this.CRN = this.activeRoute.snapshot.queryParamMap.get("CRN");
      this.role = this.activeRoute.snapshot.queryParamMap.get("role");
      this.insurerUrl = this.activeRoute.snapshot.queryParamMap.get("insurerUrl");
      this.sendVisible = this.activeRoute.snapshot.queryParamMap.get("sendVisible");
      this.highRiskMafAge = this.activeRoute.snapshot.queryParamMap.get("highRiskMafAge");
      this.redirectionUrl = this.activeRoute.snapshot.queryParamMap.get("redirectionUrl");
      //this.redirectionUrl = `work-flow/quotes`;
      //UNCOMMENT THIS FOR Redirection to Quotes Flow ATUTOMATICALLY


      // Transform the response to Array used for create quote using  lodash.
      this.transformedResultResponse = await this.distributorV1Service.quoteDetails;

      let currentDate = new Date();
      this.todaydate = moment(currentDate).format("MMM DD YYYY");

      this.quoteGeneratedDate = moment(this.transformedResultResponse.companyDetails.quoteGeneratedDate).format("MMM DD YYYY");

      this.transformedResultResponse["quotes"] = this.transformedResultResponse["quotes"].filter((obj) => {
        return obj.selector;
      });

      this.transformedResultResponse = await this.pdfService.createTransformedResponse(this.CRN, this.insurerUrl, this.role, this.transformedResultResponse);

      this.transformedResultResponse = this.mapCensusCount(this.transformedResultResponse);

      this.transformedResultResponse = await this.pdfService.createTransformedBenefits(this.transformedResultResponse);

      this.transformCensustoTable(this.transformedResultResponse);

      await this.generatePremiumTable(this.transformedResultResponse);

      this.category = await this.createBenefits();

      this.exclusions = await this.pdfService.createExclusions(this.transformedResultResponse, this.CRN, this.insurerUrl, this.role, this.redirectionUrl, this.highRiskMafAge);
      console.log(this.transformedResultResponse);
      this.policyHolder = this.transformedResultResponse.companyDetails.company_name
      this.quotationNumber = `${this.transformedResultResponse?.companyDetails?.client_reference_number} ${this.transformedResultResponse?.companyDetails?.version ? '/' + this.transformedResultResponse?.companyDetails?.version : ''}`
      await this.generatePdf(this.transformedResultResponse);

    } catch (error) {
      this.commonService.errorResponseData(error);
      this.spinner.hide();
      throw error;
    } finally {
      this.distributorV1Service.quoteDetails = [];
      this.modalServices.dismissAll();
      let queryParams = this.role === "distributor" ? { queryParams: { CRN: `${this.CRN}`, sendVisible: "true", highRiskMAFAge: this.highRiskMafAge } } : { queryParams: { CRN: `${this.CRN}`, sendVisible: "false" } };
      this.router.navigate([`/${this.insurerUrl}/${this.role}-v1/${this.redirectionUrl}`], queryParams);
      this.spinner.hide();
    }
  }



  async generateCensusTable(census) {
    this.census = [];
    for (var i = 0; i < census.length; i++) {
      this.census.push({
        No: `${i + 1}`,
        Employee: `${census[i].employeeId}`,
        Relations: `${census[i].relations}`,
        Premium: `${census[i].premium}`,
        Category: `${census[i].category}`,
      });
    }
    return {
      data: this.census,
    };
  }


  formTpaSection(transformedResultResponse, insurerUrl) {
    transformedResultResponse["quotes"].map((quote) => {
      quote.data.map((category) => {
        let newTpaSection = { group_details: "Policy Details", tob_header: "TPA", tob_value: category.data.tpa.tpa_name };
        category.data.mandatory_benefits.splice(0, 0, newTpaSection);
        let newPlanSection = { group_details: "Policy Details", tob_header: "Plan", tob_value: category.data.plan.plan_name };
        category.data.mandatory_benefits.splice(0, 0, newPlanSection);
      })

    });
    return transformedResultResponse;
  }

  async createBenefits(): Promise<any> {
    try {
      return new Promise(async (resolve, reject) => {
        let FinalPdf: { table: {} }[] = [];
        let quoteHeadersDisplay: any;
        let benefitHeaders: any;
        let benefitValues: any;
        let premiumHeaders: any;
        let premiumValues: any;
        let censusHeaders: any;
        let censusValues: any;
        let categoryPremiumHeaders: any;
        let categoryPremiumValues: any;
        let premiumTotal: any;
        let memberCountTable: any;

        //Forming Mandatory and Optional Benefits.
        this.transformedResultResponse = this.pdfService.formMandatoryAndOptionalBenefits(this.transformedResultResponse);

        //Adding Regulatory Compliance for the category.
        this.transformedResultResponse = this.pdfService.formRegulatoryComplianceSection(this.transformedResultResponse, this.insurerUrl);

        this.transformedResultResponse = this.formTpaSection(this.transformedResultResponse, this.insurerUrl);

        //Making the premium details as an seperate array inside the categories.
        this.transformedResultResponse = this.formPremiumDetailsWithHeadings();

        await Promise.all(
          this.transformedResultResponse["quotes"].map(async (quote, i) => {
            //Quote Table
            let quoteOptions = {
              text: { text: "Categories & Premium ", style: ["title"] },
              table: {
                widths: [170, 170, 170],
                body: [],
              },
            };

            let riskType = quote.risk_type === "no" ? "" : "&" + " " + quote.risk_type.toUpperCase();
            quoteOptions.table.body.push([
              { text: `Quote ${i + 1}`, style: ["categoryTitle"], width: 100 },
              { text: `${quote.quote_type.charAt(0).toUpperCase() + quote.quote_type.slice(1) + " " + "Quote"} ${riskType}  `, style: ["categoryTitle"], width: "*" },
              {
                text:
                  `${this.transformedResultResponse?.quotes[0]?.currency} ` +
                  quote.option_premium.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }),
                style: ["categoryTitle"],
                width: 150
              },
            ]);

            //Premium and category table
            let categoryPremiumTable = {
              text: { text: "Categories & Premium ", style: ["title"] },
              table: {
                widths: [261, 261],
                body: [],
              },
            };

            //Benefits and Category table
            let categoryBenefitsTable = {
              text: { text: "Categories & Benefits ", style: ["title"] },
              table: {
                widths: [261, 261],
                body: [],
              },
            };

            quoteHeadersDisplay = { table: quoteOptions.table, margin: [0, 10, 0, 0], pageBreak: "before" };
            FinalPdf.push(quoteHeadersDisplay);

            let widths = [];


            if (quote.data.length == 1) {
              widths = [261, 261];
            } else if (quote.data.length === 2) {
              widths = [170, 170, 170];
            } else if (quote.data.length === 3) {
              widths = [125, 125, 125, 125];
            } else if (quote.data.length === 4) {
              widths = [98, 98, 98, 98, 98];
            } else if (quote.data.length === 5) {
              widths = ["auto", "auto", "auto", "auto", "auto", "auto"];
            } else if (quote.data.length === 6) {
              widths = [67.2, 67.2, 67.2, 67.2, 67.2, 67.2, 67.2];
            }

            /***** Start of Categories and premium section ****/

            //Premium details

            let orderedPremiumGroupsHeaders = this.pdfService.formPremiumDetails(quote.data);

            let PremiumOptions = {
              table: {
                widths: widths,
                body: [],
                fontSise: 10
              },
            };

            //Applying style to the headers.
            const cates = quote.data.map((cat) => {
              return {
                text: cat.category_name,
                style: ["categoryTitle"],
                fontSise: 10
              };
            });

            let premiumHeadings = [{ text: "Premium", style: ["categoryTitle"], fontSise: 10 }, ...cates];
            PremiumOptions.table.body.push(premiumHeadings);

            // PremiumOptions.table.body = this.pdfService.formPremiumDetailsTable(orderedPremiumGroupsHeaders, quote.data, PremiumOptions, this.insurerUrl);
            PremiumOptions.table.body = this.pdfService
              .formPremiumDetailsTable(orderedPremiumGroupsHeaders, quote.data, PremiumOptions, this.insurerUrl)
              .map((row) =>
                row.map((cell) => ({
                  ...cell,
                  fontSize: 10, // Apply font size to each cell
                }))
              );

            categoryPremiumHeaders = { ...categoryPremiumTable.text, margin: [0, 10, 0, 0], fontSise: 10 };
            categoryPremiumValues = { table: PremiumOptions.table, margin: [0, 10, 0, 0], fontSise: 10 };
            FinalPdf.push(categoryPremiumHeaders, categoryPremiumValues);

            /***** End of Categories and premium section ****/

            /***** Start of Categories and Benefits section ****/

            let orderedMandatoryGroupsHeaders = this.pdfService.formMandatoryBenefits(quote.data);

            let orderedOptionalGroupsHeaders = this.pdfService.formOptionalBenefits(quote.data);

            let benefitOptions = {
              table: {
                widths: widths,
                body: [],
              },
            };

            const categories = quote.data.map((cat) => {
              return {
                text: cat.category_name,
                style: ["categoryTitle"],
              };
            });
            let headings = [{ text: "Benefits", style: ["categoryTitle"] }, ...categories];
            benefitOptions.table.body.push(headings);

            //Forming the Mandatory Benefits table.
            benefitOptions.table.body = this.pdfService.formMandatoryBenefitsTable(orderedMandatoryGroupsHeaders, quote.data, benefitOptions, this.insurerUrl);

            //Forming the optional benefits table.
            if (orderedOptionalGroupsHeaders.length > 0) {
              benefitOptions.table.body = this.pdfService.formOptionalBenefitsTable(orderedOptionalGroupsHeaders, quote.data, benefitOptions, this.insurerUrl);
            }

            benefitOptions.table.body = this.pdfService.removeDuplicateBenefitGroupdetails(benefitOptions.table.body);

            benefitHeaders = { ...categoryBenefitsTable.text, margin: [0, 10, 0, 0], fontSize: 10 };
            benefitValues = { table: benefitOptions.table, margin: [0, 10, 0, 0], fontSize: 10 };
            FinalPdf.push(benefitHeaders, benefitValues);

            /***** End of Categories and Benefits section ****/

            await Promise.all(
              quote.data.map((category: any, index) => {
                if (category.census.length > 0) {
                  let categoryCensusTable = {
                    text: { text: `MAF Required Members - ${category.category_name}`,   style: {
                      color: '#000000',
                      bold:true,
                      fontSize: 10
                    } },
                    table: {
                      widths: ['6%', '12%', '22%', '10%', '6%', '20%', '11%', '13%'],
                      body: this.buildTableBody(category.census, category.census, this.transformedResultResponse),
                    },
                  };

                  censusHeaders = { ...categoryCensusTable.text, margin: [0, 10, 0, 0], fontSise: 10, pageBreak: "before" };
                  censusValues = { table: categoryCensusTable.table, margin: [0, 10, 0, 0], fontSize: 10 };

                  FinalPdf.push(censusHeaders, censusValues);
                }

                let globalMaternityEligibleStatus;
                category.data.census.map(obj => {
                  if (obj.is_maternity_eligible === null) {
                    globalMaternityEligibleStatus = false;
                  } else {
                    globalMaternityEligibleStatus = true;
                  }
                })
                // Define the text and style for the category title
                let categoryTitle = {
                  text: `Age Band - ${category.data.emirates.emirates_name} - ${category.category_name}`,
                  style: ["title"],
                  fontSise: 10
                };
                // Check if 'singleFemalePremiumDisplay' exists
                let isSingleFemalePremiumDisplay = category.data['age_values'][0].member['Employee'].hasOwnProperty('singleFemalePremiumDisplay') ||
                  category.data['age_values'][0].member['Dependents'].hasOwnProperty('singleFemalePremiumDisplay');
                let isMaternityFemalePremiumDisplay = category.data['age_values'][0].member['Employee'].hasOwnProperty('singleFemalePremiumDisplay') ||
                  category.data['age_values'][0].member['Dependents'].hasOwnProperty('singleFemalePremiumDisplay');
                // Determine which table body to use based on the condition
                let tableBody;
                let widths;
                if (isSingleFemalePremiumDisplay) {
                  console.log("SingleFemalePremiumDisplay");
                  widths = [31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7],
                    tableBody = this.buildTableBody4(
                      category.data["age_values"],
                      category.data["age_values"],
                      `${this.transformedResultResponse?.quotes[0]?.currency} ${category.data.totalPremium.toLocaleString("en-US")}`,
                      `${category.data.totalMemberCount}`
                    );
                } else {
                  console.log("else Part");
                  widths = [31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7],
                    tableBody = this.buildTableBody3(
                      category.data["age_values"],
                      category.data["age_values"],
                      `${this.transformedResultResponse?.quotes[0]?.currency} ${category.data.totalPremium.toLocaleString("en-US")}`,
                      `${category.data.totalMemberCount}`
                    );
                }
                if (category.data.pdfAgeBandDetails && globalMaternityEligibleStatus) {
                  const pageBreak = [
                    { text: '' },
                    { text: '' },
                    { text: '' },
                    { text: '' },
                    { text: '' },
                    { text: '', pageBreak: 'before' },
                  ];
                  widths = [80, 80, 80, 80, 80, 80];
                  // Member count
                  let memberCountTableBody = this.updateBackgrounds(this.pdfService.displayCount(category.data.pdfAgeBandDetails, category.data.pdfAgeBandDetails))
                  // Optionally append or replace with another table body
                  let grossPremiumTableBody = this.updateBackgrounds(this.pdfService.displayGrossPremium(category.data.pdfAgeBandDetails, category.data.pdfAgeBandDetails))
                  // Optionally append or replace with another table body
                  let totalGrossPremiumTableBody = this.updateBackgrounds(this.pdfService.displayTotalGrossPremium(category.data.pdfAgeBandDetails, category.data.pdfAgeBandDetails))
                  let spacerRow = [{ text: '', colSpan: widths.length, margin: [0, 3, 0, 0] }];
                  tableBody = [...memberCountTableBody, spacerRow, ...grossPremiumTableBody, spacerRow, ...totalGrossPremiumTableBody]; // Combine or replace as needed
                }
                // Define the category premium table object
                let categoryPremiumTable = {
                  text: categoryTitle,
                  table: {
                    widths: widths,
                    body: tableBody
                  },
                  fontSise: 10
                };
                premiumHeaders = { ...categoryPremiumTable.text, margin: [0, 5, 0, 0], fontSise: 10, pageBreak: "before" };
                memberCountTable = { table: categoryPremiumTable.table, margin: [0, 5, 0, 0], fontSise: 10 };
                FinalPdf.push(premiumHeaders, memberCountTable);

                // //Age Band Table
                // let categoryPremiumTable = {
                //   text: { text: ` Age Band - ${category.data.emirates.emirates_name} -  ${category.category_name}`, style: ["categoryTitle"] },
                //   table: {
                //     widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                //     body: category.data['age_values'][0].member['Employee'].hasOwnProperty('singleFemalePremiumDisplay') || category.data['age_values'][0].member['Dependents'].hasOwnProperty('singleFemalePremiumDisplay')? this.buildTableBody4(category.data["age_values"], category.data["age_values"],`${this.transformedResultResponse?.quotes[0]?.currency} ${category.data.totalPremium.toLocaleString("en-US")}`,`${category.data.totalMemberCount}`) : this.buildTableBody3(category.data["age_values"], category.data["age_values"],`${this.transformedResultResponse?.quotes[0]?.currency} ${category.data.totalPremium.toLocaleString("en-US")}`,`${category.data.totalMemberCount}`),
                //   },
                //   // text1:{text:`Total - ${this.transformedResultResponse?.quotes[0]?.currency} ${category.data.totalPremium.toLocaleString("en-US")}`,style:["categoryTitle"]}
                // };

                // premiumHeaders = { ...categoryPremiumTable.text, margin: [0, 10, 0, 0], pageBreak: "before" };
                // premiumValues = { table: categoryPremiumTable.table, margin: [0, 10, 0, 0] };
                // // premiumTotal = { ...categoryPremiumTable.text1, margin: [500, 10, 0, 0] };

                // FinalPdf.push(premiumHeaders, premiumValues);

              })
            );
          })
        );
        resolve(FinalPdf);
      });
    } catch (error) {
      this.toasterService.error("Something Went Wrong");
      this.spinner.hide();
      throw error;
    } finally {
      this.modalServices.dismissAll();
      let queryParams = this.role === "distributor" ? { queryParams: { CRN: `${this.CRN}`, sendVisible: "true", highRiskMAFAge: this.highRiskMafAge } } : { queryParams: { CRN: `${this.CRN}`, sendVisible: "false" } };
      this.router.navigate([`/${this.insurerUrl}/${this.role}-v1/${this.redirectionUrl}`], queryParams);
      this.spinner.hide();
    }
  }


  // taken from pdfservice************************************************************
  premiumTable(data: any, insurerURL, columns: any) {
    let widths;

    if (columns.length === 1) {
      widths = ['100%']; // Single column takes the entire width
    } else {
      const totalWidth = 510; // Total available width for A4 portrait in points
      const columnWidth = totalWidth / columns.length; // Calculate width per column
      widths = Array(columns.length).fill(columnWidth); // Create an array of equal widths
    }

    return {
      margin: [0, 30, 30, 30],
      table: {
        headerRows: 1,
        widths: widths,
        height: [20],
        body: this.buildPremiumTableBody(data, insurerURL, columns),
      },
      width: 900,
      style: {
        lineHeight: 1.2,
        fontSize: 10,
        font: "Calibri",

      }
    };
  }

  buildPremiumTableBody(data: any, insurerURL, columns: any) {
    var body = [];
    var headerRow: any = [];
    columns.forEach((key) => {
      let headerCell: any = {
        text: key,
        color: "#FFFFFF",
        fillColor: "#067084",
        fontSize: "10",
      };

      headerRow.push(headerCell);
    });
    body.push(headerRow);
    data.forEach(function (row: any) {
      var dataRow: any = [];

      columns.forEach(function (column: any) {
        dataRow.push([{ text: row[column], fontSize: "10", bold: row['Categories'].trim().toLowerCase() === 'total' ? true : false }]);
      });
      body.push(dataRow);
    });
    return body;
  }

  updateBackgrounds(displayCountBody) {
    return displayCountBody.map((row, index) => {
      // Apply specific background colors based on row index
      return row.map(cell => {
        if (cell.text || cell.colSpan) {
          // Apply background color only to non-empty cells
          if (index === 0) {
            return {
              ...cell,
              fillColor: "#067084", // Header background
              color: "#FFFFFF" // Header text color
            };
          } else if (index === 1) {
            return {
              ...cell,
              fillColor: "#69A9B5", // Second row background
              color: "#FFFFFF" // Second row text color
            };
          } else if (index === 2) {
            return {
              ...cell,
              fillColor: "#69A9B5", // Third row background
              color: "#FFFFFF" // Third row text color
            };
          }
        }
        return cell; // Return empty cell without modification
      });
    });
  }

  // ************************************************************
  formPremiumDetailsWithHeadings() {
    this.transformedResultResponse["quotes"].map((quote) => {
      quote.data.map((category) => {
        category.data.premium_details = [];
        category.data.premium_details.push({
          group_details: "Premium",
          tob_header: "GWP",
          tob_value:
            `${this.transformedResultResponse?.quotes[0]?.currency}` +
            " " +
            category.GWP.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
        });
        if (category.data.emirates.emirates_name.trim().toLowerCase() === "dubai") {
          category.data.premium_details.push({ group_details: "Premium", tob_header: "Basmah Fee / ICP Fee", tob_value: `${this.transformedResultResponse?.quotes[0]?.currency}` + " " + category.totalBasmahFee });
        } else {
          category.data.premium_details.push({ group_details: "Premium", tob_header: "Basmah Fee / ICP Fee", tob_value: `${this.transformedResultResponse?.quotes[0]?.currency}` + " " + category.totalIcpFee });
        }

        if (category.data.emirates.emirates_name.trim().toLowerCase() === "dubai") {
          category.data.premium_details.push({
            group_details: "Premium",
            tob_header: "GWP With Basmah Fee / GWP With ICP Fee",
            tob_value:
              `${this.transformedResultResponse?.quotes[0]?.currency}` +
              " " +
              category.GWP_With_BasmahFee.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
          });
        } else {
          category.data.premium_details.push({
            group_details: "Premium",
            tob_header: "GWP With Basmah Fee / GWP With ICP Fee",
            tob_value:
              `${this.transformedResultResponse?.quotes[0]?.currency}` +
              " " +
              category.GWP_With_IcpFee.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
          });
        }
        category.data.premium_details.push({
          group_details: "Premium",
          tob_header: "VAT",
          tob_value:
            `${this.transformedResultResponse?.quotes[0]?.currency}` +
            " " +
            category.GWP_With_Vat.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
        });

        category.data.premium_details.push({
          group_details: "Premium",
          tob_header: "Total Premium",
          tob_value:
            `${this.transformedResultResponse?.quotes[0]?.currency}` +
            " " +
            category.category_premium.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
        });

        let splittedCategoryName = category.category_name.split(" ");
        let loweCasecategory = splittedCategoryName[0].charAt(0).toUpperCase() + splittedCategoryName[0].slice(1);
        category.category_name = loweCasecategory + " " + splittedCategoryName[1];
      });
    });
    return this.transformedResultResponse;
  }

  mapCensusCount(transformedResultResponse) {
    const groupedCensus = _.groupBy(transformedResultResponse["allCensusData"], "category");

    Object.keys(groupedCensus).map((key) => {
      const censusCategoryName = key.toUpperCase();
      transformedResultResponse["quotes"].map((option) => {
        option.data.map((category) => {
          if (category.category_name.toUpperCase() == censusCategoryName) {
            category["member_count"] = groupedCensus[key].length;
          }
        });
      });
    });
    return transformedResultResponse;
  }

  transformCensustoTable(transformedResultResponse) {

    let categoryLength = transformedResultResponse.quotes[0].data.length;
    this.categoryCount = [];
    this.optionsPremium = [];

    for (let catind = 0; catind < categoryLength; catind++) {
      let optionsPremium = [];
      transformedResultResponse.quotes.map((option) => {
        optionsPremium.push(
          `${this.transformedResultResponse?.quotes[0]?.currency}` +
          " " +
          option.data[catind].category_premium.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      });

      let catMember = transformedResultResponse.quotes[0].data[catind].member_count;
      let catName = transformedResultResponse.quotes[0].data[catind].category_name;
      let splittedCategoryName = catName.split(" ");
      let loweCasecategory = splittedCategoryName[0].charAt(0).toUpperCase() + splittedCategoryName[0].slice(1);
      let categoryName = loweCasecategory + " " + splittedCategoryName[1];

      let totalPremium;
      let obj = { name: categoryName, members: catMember, options_premium: optionsPremium, total_premium: `${this.transformedResultResponse?.quotes[0]?.currency}` + " " + formatNumber(Number(totalPremium), "en-US", "1.0-0") };
      this.categoryCount.push(obj);
    }
  }

  table(data: any, columns: any) {
    return {
      margin: [0, 10, 30, 30],
      table: {
        headerRows: 1,
        widths: [98, 98, 98, 98, 98],
        height: [20],
        body: this.buildTableBody(data, columns, this.transformedResultResponse),
      },
      layout: {
        hLineWidth: function (i, node) {
          return i === 0 || i === node.table.body.length ? 1 : 1;
        },
        vLineWidth: function (i, node) {
          return i === 0 || i === node.table.widths.length ? 1 : 1;
        },
        paddingLeft: function (i, node) {
          return 2;
        },
        paddingRight: function (i, node) {
          return 2;
        },
        paddingTop: function (i, node) {
          return 6;
        },
        paddingBottom: function (i, node) {
          return 2;
        },
      },
      width: 595,
      style: {
        lineHeight: 1.2,
        fontSize: 12,
        font: "Calibri",
      },
    };
  }

  buildTableBody(data: any, columns: any, transformedResultResponse) {
    var body = [];
    body.push([
      {
        text: "S.No",
        alignment: "center",
        bold: true,
        style: "header",
        fillColor: "#067084",
        color: "#FFFFFF",
      },
      {
        text: "Employee Id",
        alignment: "center",
        bold: true,
        style: "header",
        fillColor: "#067084",
        color: "#FFFFFF",
      },
      {
        text: "Employee Name",
        alignment: "center",
        bold: true,
        style: "header",
        fillColor: "#067084",
        color: "#FFFFFF",
      },
      {
        text: "Relations",
        alignment: "center",
        bold: true,
        style: "header",
        fillColor: "#067084",
        color: "#FFFFFF",
      },
      {
        text: "Age",
        alignment: "center",
        bold: true,
        style: "header",
        fillColor: "#067084",
        color: "#FFFFFF",
      },
      {
        text: "Premium",
        alignment: "center",
        bold: true,
        style: "header",
        fillColor: "#067084",
        color: "#FFFFFF",
      },
      {
        text: "Category",
        alignment: "center",
        bold: true,
        style: "header",
        fillColor: "#067084",
        color: "#FFFFFF",
      },
      {
        text: "Member Type ",
        alignment: "center",
        bold: true,
        style: "header",
        fillColor: "#067084",
        color: "#FFFFFF",
      },
    ]);

    data.forEach(function (row: any, index) {
      var dataRow: any = [];
      let finalUpdatedLoadedPremium = row?.updated_loaded_premium.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      dataRow.push({ text: index + 1, alignment: "center" }, { text: row?.employee_id, alignment: "center" }, { text: row?.employee_name, alignment: "center" }, { text: row?.relations, alignment: "center" }, { text: row?.age, alignment: "center" }, { text: `${transformedResultResponse?.quotes[0]?.currency}` + " " + finalUpdatedLoadedPremium, alignment: "center" }, { text: row?.category, alignment: "center" }, { text: row?.member_type, alignment: 'center' });
      body.push(dataRow);
    });
    return body;
  }

  async generatePremiumTable(transformedResultResponse) {
    this.categoryCount.map((obj, index) => {
      this.totalMembers += obj.members;
    });

    transformedResultResponse["quotes"].map((obj) => {
      this.premiumForOption.push(
        `${this.transformedResultResponse?.quotes[0]?.currency}` +
        " " +
        obj.option_premium.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    });
    let obj = { name: "Total", members: this.totalMembers, options_premium: this.premiumForOption, total_premium: 0 };
    this.categoryCount.push(obj);

    this.premiumDetails = [];
    let premiumObj;
    for (let i = 0; i < this.categoryCount.length; i++) {
      premiumObj = {
        Categories: this.categoryCount[i].name,
        Members: this.categoryCount[i].members,
      };

      for (let y = 0; y < transformedResultResponse["quotes"].length; y++) {
        let name = transformedResultResponse["quotes"][y]["option_name"].charAt(0).toUpperCase() + transformedResultResponse["quotes"][y]["option_name"].slice(1);
        let data = this.categoryCount[i].options_premium[y];
        premiumObj[`${name}`] = data.toLocaleString('en-US');
      }
      this.premiumDetails.push(premiumObj);
    }
    return {
      data: this.premiumDetails,
    };
  }

  buildTableBody3(data, columns, premium, member) {
    var body = [];

    body.push(
      [
        {
          text: "Age band",
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          bold: true,
        },
        {
          text: "Employees",
          colSpan: 4,
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          bold: true,
        },
        {},
        {},
        {},
        {
          text: "Dependents",
          colSpan: 4,
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          bold: true,
        },
        {},
        {},
        {},
        {
          text: "Total",
          colSpan: 4,
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          bold: true,
        },
        {},
        {},
        {},
      ],
      [
        {
          text: "Age Band",
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          rowSpan: 2,
          bold: true,
        },
        {
          text: "Member Count",
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          bold: true,
          colSpan: 2,
        },
        {},
        {
          text: `Premium (${this.transformedResultResponse?.quotes[0]?.currency})`,
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          bold: true,
          colSpan: 2,
        },
        {},
        {
          text: "Member Count",
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          bold: true,
          colSpan: 2,
        },
        {},
        {
          text: `Premium (${this.transformedResultResponse?.quotes[0]?.currency})`,
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          bold: true,
          colSpan: 2,
        },
        {},
        {
          text: "Member Count",
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          bold: true,
          colSpan: 2,
        },
        {},
        {
          text: `Premium (${this.transformedResultResponse?.quotes[0]?.currency})`,
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          bold: true,
          colSpan: 2,
        },
        {},
      ],
      [

        {},
        {
          text: "Male",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Female",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Male",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Female",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Male",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Female",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Male",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Female",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Male",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Female",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Male",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Female",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
      ]
    );
    data.forEach(function (row: any) {
      var dataRow: any = [];

      let maleEmployeePremium = row?.member?.Employee?.malePremiumDisplay
        ? row?.member?.Employee?.malePremiumDisplay.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        : "";

      let femaleEmployeePremium = row?.member?.Employee?.femalePremiumDisplay
        ? row?.member?.Employee?.femalePremiumDisplay.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        : "";

      let maleDependentsPremium = row?.member?.Dependents?.malePremiumDisplay
        ? row?.member?.Dependents?.malePremiumDisplay.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        : "";

      let femaleDependentsPremium = row?.member?.Dependents?.femalePremiumDisplay
        ? row?.member?.Dependents?.femalePremiumDisplay.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        : "";

      let totalMale = row?.member?.totalMale
        ? row?.member?.totalMale.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        : "";

      let totalFemale = row?.member?.totalFemale
        ? row?.member?.totalFemale.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        : "";

      dataRow.push({ text: row?.age || "", alignment: "center" }, { text: row?.member?.Employee?.maleCount || "", alignment: "center" }, { text: row?.member?.Employee?.femaleCount || "", alignment: "center" }, { text: maleEmployeePremium, alignment: "center" }, { text: femaleEmployeePremium, alignment: "center" }, { text: row?.member?.Dependents?.maleCount || "", alignment: "center" }, { text: row?.member?.Dependents?.femaleCount || "", alignment: "center" }, { text: maleDependentsPremium, alignment: "center" }, { text: femaleDependentsPremium, alignment: "center" }, { text: row?.member?.maleMemberCount || "", alignment: "center" }, { text: row?.member?.femaleMemberCount || "", alignment: "center" }, { text: totalMale, alignment: "center" }, { text: totalFemale, alignment: "center" });
      body.push(dataRow);
    });
    body.push([{ text: "Total", colSpan: 9, alignment: 'right', style: ["categoryTitle"] }, {}, {}, {}, {}, {}, {}, {}, {}, { text: `Members : ${member}`, colSpan: 2, style: ["categoryTitle"] }, {}, { text: `Premium : ${premium}`, colSpan: 2, style: ["categoryTitle"] }, {}]);
    body.map((obj, index) => {
      if (!obj) {
        body.splice(index, 1);
      }
    });
    return body;
  }

  buildTableBody4(data, columns, premium, member) {
    var body = [];

    body.push(
      [
        {
          text: "Age band",
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          bold: true,
        },
        {
          text: "Employees",
          colSpan: 3,
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          bold: true,
        },
        {},
        {},
        {
          text: "Dependents",
          colSpan: 3,
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          bold: true,
        },
        {},
        {},
        {
          text: "Total",
          colSpan: 6,
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          bold: true,
        },
        {},
        {},
        {},
        {},
        {}
      ],
      [
        {
          text: "Age Band",
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          rowSpan: 2,
          bold: true,
        },
        {
          text: `Premium (${this.transformedResultResponse?.quotes[0]?.currency})`,
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          bold: true,
          colSpan: 3,
        },
        {},
        {},
        {
          text: `Premium (${this.transformedResultResponse?.quotes[0]?.currency})`,
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          bold: true,
          colSpan: 3,
        },
        {},
        {},
        {
          text: "Member Count",
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          bold: true,
          colSpan: 3,
        },
        {},
        {},
        {
          text: `Premium (${this.transformedResultResponse?.quotes[0]?.currency})`,
          alignment: "center",
          fillColor: "#067084",
          color: "#FFFFFF",
          bold: true,
          colSpan: 3,
        },
        {},
        {}
      ],
      [
        {},
        {
          text: "Male",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Single Female",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Married Female",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Male",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Single Female",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Married Female",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Male",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Single Female",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Married Female",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Male",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Single Female",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
        {
          text: "Married Female",
          alignment: "center",
          fillColor: "#69A9B5",
          color: "#FFFFFF",
        },
      ]
    );
    data.forEach(function (row: any) {
      var dataRow: any = [];

      let maleEmployeePremium = row?.member?.Employee?.malePremiumDisplay
        ? row?.member?.Employee?.malePremiumDisplay.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        : "";

      let singleFemaleEmployeePremium = row?.member?.Employee?.singleFemalePremiumDisplay
        ? row?.member?.Employee?.singleFemalePremiumDisplay.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        : "";

      let marriedFemaleEmployeePremium = row?.member?.Employee?.marriedFemalePremiumDisplay
        ? row?.member?.Employee?.marriedFemalePremiumDisplay.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        : "";

      let maleDependentsPremium = row?.member?.Dependents?.malePremiumDisplay
        ? row?.member?.Dependents?.malePremiumDisplay.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        : "";

      let singleFemaleDependentsPremium = row?.member?.Dependents?.singleFemalePremiumDisplay
        ? row?.member?.Dependents?.singleFemalePremiumDisplay.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        : "";

      let marriedFemaleDependentsPremium = row?.member?.Dependents?.marriedFemalePremiumDisplay
        ? row?.member?.Dependents?.marriedFemalePremiumDisplay.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        : "";

      let totalMale = row?.member?.totalMale
        ? row?.member?.totalMale.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        : "";

      let totalSingleFemale = row?.member?.totalSingleFemale
        ? row?.member?.totalSingleFemale.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        : "";

      let totalMarriedFemale = row?.member?.totalMarriedFemale
        ? row?.member?.totalMarriedFemale.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        : "";

      dataRow.push({ text: row?.age || "", alignment: "center" }, { text: maleEmployeePremium, alignment: "center" }, { text: singleFemaleEmployeePremium, alignment: "center" }, { text: marriedFemaleEmployeePremium, alignment: "center" }, { text: maleDependentsPremium, alignment: "center" }, { text: singleFemaleDependentsPremium, alignment: "center" }, { text: marriedFemaleDependentsPremium, alignment: "center" }, { text: row?.member?.maleMemberCount || "", alignment: "center" }, { text: row?.member?.singleFemaleMemberCount || "", alignment: "center" }, { text: row?.member?.marriedFemaleMembeCount || "", alignment: "center" }, { text: totalMale, alignment: "center" }, { text: totalSingleFemale, alignment: "center" }, { text: totalMarriedFemale, alignment: "center" });

      body.push(dataRow);
    });
    body.push([{ text: "Total", colSpan: 7, alignment: 'right', style: ["categoryTitle"] }, {}, {}, {}, {}, {}, {}, { text: `Members : ${member}`, colSpan: 3, style: ["categoryTitle"] }, {}, {}, { text: `Premium : ${premium}`, colSpan: 3, style: ["categoryTitle"] }, {}, {}]);
    body.map((obj, index) => {
      if (!obj) {
        body.splice(index, 1);
      }
    });
    return body;
  }

  generatePdf(transformedResultResponse) {
    console.log(this.CRN)
    let horizontalLine = () => {
      return [{
        type: 'line',
        x1: 0,
        y1: 0,
        x2: 515, // Full width of the PDF
        y2: 0,
        lineWidth: 1,
        lineColor: '#878787',
      },
      ]
    }
    let termsAndConditions1 = {
      ul: [
        { text: "Please refer to the Policy Wording for exclusion list and definitions.", },
        { text: "All Benefits shown are per insured person, per Period of Cover (One year)." },
        { text: "All limits and Co-payments are expressed in Arab Emirates Dirham." },
        { text: "This quotation is valid for residents of Dubai and Northern Emirates only." }
      ],
      fontSize: 9,
      lineHeight: 1.1
    }

    let termsAndConditions2 = {
      ul: [
        {
          text: 'NOTE: As per ICP directive (Reference circular number 18/4/13; Dated 2 March 2023): All members getting enrolled on and after 15-05-2023 will be charged ICP Fee of (AED 24 + VAT per member). This fee is for data integration with the Federal Authority for Identity, Nationality, Customs and Port Security for all UAE visa holders excluding Dubai visa holders.',
        },
        {
          text: 'This will be applicable for members enrolling into newly incepted policies and addition of members on existing policies. Uploading/adding a member record with a unique UID is chargeable (AED 24 + 5% VAT) and so is updating a UID (in case the original record of a member was added with a wrong UID).'
        },
        { text: 'This quotation is valid for 30 days from the day of issuance.' },
        {
          text: 'Insurer reserves the right to amend terms, rates, and conditions in the event of any findings later revealed which would indicate misrepresented or undisclosed material facts that could affect the policy performance or make the insured risk significantly different than at the time of the initial quotation. Non-disclosure or misrepresentation of such material facts for members at inception of the policy as well as on the addition of any member can result in your policy being cancelled or claim being declined.',
        },
        {
          text: 'The insurer reserves the right to re-price or re-validate the premium if the membership changes by over 5% from the date the quotation until the policy inception date.'
        },
        {
          text: 'Group sizes of 10 or fewer employees are subject to individual medical underwriting through a medical application form (MAF). The premiums provided are indicative and non-binding subject to MAF. Please refer to your insurer for final premiums.',
        },
        {
          text: 'The maximum eligible age limit at inception of the policy is 64 years. Members 65 years of age and older are subject to individual medical underwriting and MAF.'
        },
        {
          text: 'Any applicant in the age bracket of 60-64 years should submit (if requested by the Insurance Company) a medical health certificate from a UAE-based Registered Medical Practitioner. The same should be mandatorily submitted by applicants above 65 years of age even if there are no medical declarations to be made on the MAF.',
        },
        {
          text: 'This quotation should be issued for group sizes greater than or equal to 5 employees. Groups with less than 5 employees should be referred to your insurer for quotation.',
        },
        {
          text: 'This quotation is valid for UAE only. The quote assumes insurance coverage for all employees residing in UAE on valid resident visa along with their direct dependents (Spouse and Children). For any deviation, kindly refer to your insurer for quotation.',
        },
        {
          text: 'The maximum age at entry for “children” in the policy will be the age bracket of 0-18 years. Further, overage “children” i.e., in the age bracket of 19-23 years can be added subject to being part of the expiring policy and/or receiving the student ID and not allowed to work visa status. For any other deviation kindly refer to your insurer for confirmation',
         
        },
        {
          text: 'The Quotation is restricted to 150 members only at the time of inception. For larger groups kindly refer to your insurer for quotation.',
        },
        {
          text: 'The Quotation for groups between 100-150 members will not be valid on standard SME terms, and the insurer reserves the right to re-price/re-validate if claims information is available.',
        },
        {
          text: 'The Quotation for special risk groups is valid subject to final insurer approval. Groups such as:',
          ol: [
            { text: 'Taxi and transportation companies' },
            { text: 'Medical providers' },
            { text: 'Insurance company or brokerages or TPA' },
            { text: 'Associations and charitable organizations' },
            { text: 'Recruitment and Manpower Companies' },
            { text: 'Airline companies' },
            { text: 'Military or Police organizations' },
          ],
        },
        {
          text: 'This Quotation is applicable only for group employees and their dependents (Spouse and Children only). Parents, other family members, and/or Maids under employees’ visas are to be excluded.',
        },
        {
          text: 'Quotation is not valid if the group (or a sub-group) is part of another parent company.',
        },
        {
          text: 'The premium and refunds for all additions and deletions respectively during the policy period will be based on pro-rata calculations.',
        },
        {
          text: 'The final census list upon “confirmation of terms” should be in line with the census list used at the time of quotation. Kindly refer to your insurer for final quotation in case of any deviation. Additionally, the insurer reserves the right to invalidate the quotation if it is generated based on falsified census.',
        },
        {
          text: 'All confirmed quotations will be subject to Ministry of Labour (MOL) checks.',
        },
        {
          text: 'Kindly refer to your insurer for a final decision if a group fails MOL checks due to the reasons listed below:',
          ul: [
            {
              text: 'If the entire group, including employees and dependents, is not enrolled under this scheme (i.e. voluntary instead of mandatory enrolment), Or',
            },
            {
              text: 'Group is split into subcategories i.e., Guardian Med+ and EBP or any other product, Or'
            },
            {
              text: 'Any other reasons'
            },
          ],
        },
        {
          text: 'This Quotation is not valid for groups with deviation of more than 10% between the confirmed census of employees and MOL list of employees. Kindly refer to your insurer for final quotation. In addition to the above, herewith also find other mandatory documentation required at the time of “Confirmation of Terms”:',
          ul: [
            { text: 'Signed and stamped Quotation. (Rates & TOB)' },
            {
              text: 'HR declaration form confirming the entire group, including all employees and eligible dependents, are enrolled under this scheme.'
            },
            { text: 'VALID Trade License & Establishment ID' },
            {
              text: 'MOL registry list of employees, confirming that all employees have enrolled. If there is no MOL for Free zone companies, then please provide alternative documents with the list of employees, confirming that all employees have enrolled.'
            },
          ],
        },
      ],
      fontSize: 9,
      lineHeight: 1.1
    }


    // Function to generate table data dynamically
    const createTableData = (policyHolder: string, quotationNumber: string, quoteGeneratedDate: string) => {
      return [
        [
          { text: 'Policyholder', fillColor: '#E9E9E9', fontSize: 10, border: [true, true, true, true] },
          { text: policyHolder, fontSize: 10, border: [true, true, true, true] },
          { text: 'Quotation Date', fillColor: '#E9E9E9', fontSize: 10, border: [true, true, true, true] },
          { text: quoteGeneratedDate, fontSize: 10, border: [true, true, true, true] }
        ],
        [
          { text: 'Quotation No', fillColor: '#E9E9E9', fontSize: 10, border: [true, true, true, true] },
          { text: quotationNumber, fontSize: 10, border: [true, true, true, true] },
          { text: 'Inception Date', fillColor: '#E9E9E9', fontSize: 10, border: [true, true, true, true] },
          { text: quoteGeneratedDate, fontSize: 10, border: [true, true, true, true] }
        ]
      ];
    };

    // Reusable function to return the table configuration with dynamic data
    const policyHolderAndQuote = (policyHolder: string, quotationNumber: string, quoteGeneratedDate: string) => {
      const tableData = createTableData(policyHolder, quotationNumber, quoteGeneratedDate);

      return {
        table: {
          widths: [100, '*', 100, 100], // Set width to '*' to make the columns take up 100% of the page
          body: tableData, // Table data with background colors and borders
        },
        layout: {
          hLineWidth: function (i, node) { return 1; }, // Horizontal line width (borders)
          vLineWidth: function (i, node) { return 1; }, // Vertical line width (borders)
          hLineColor: function (i, node) { return '#000000'; }, // Color of horizontal lines
          vLineColor: function (i, node) { return '#000000'; }, // Color of vertical lines
          paddingLeft: function (i, node) { return 10; }, // Padding for left side of the cells
          paddingRight: function (i, node) { return 10; }, // Padding for right side of the cells
          paddingTop: function (i, node) { return 5; }, // Padding for top of the cells
          paddingBottom: function (i, node) { return 5; } // Padding for bottom of the cells
        }
      };
    };



    let docDefinition = {
      pageOrientation: "portrait",
      pageMargins: [30, 100, 30, 80],

      header: {
        stack: [
          {
            columns: [
              {
                stack: [
                  { text: 'Orient Insurance PJSC', style: 'headerLine1' },
                  { text: 'Orient Building, Al Badia, Dubai Festival City', style: 'headerLine2' },
                ],
                width: '*',
              },
              {
                image: pdfImages.headerLogo, // Replace with your Base64 image
                width: 125,
                height: 45,
                alignment: 'right',
              },
            ],
          },
          {
            canvas: horizontalLine(),
            margin: [0, 10, 0, 0], // Space above the line
          },
        ],
        margin: [35, 30, 35, 0], // Adjusted header margin
      },

      footer: (currentPage: any, pageCount: any) => {
        return {
          stack: [
            {
              canvas: horizontalLine(),
              margin: [10, 10, 0, 0],
            },
            {
              columns: [
                { text: `Quotation #: ${this.quotationNumber}`, alignment: 'left', fontSize: 8, margin: [10, 5, 0, 0] },
                { text: `Generated on ${this.quoteGeneratedDate}`, alignment: 'center', fontSize: 8, margin: [0, 5, 0, 0] },
                { text: `${currentPage} of ${pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 5, 10, 0] },
              ],
            },
          ],
          margin: [30, 10, 30, 10],
        };
      },

      content: [
        policyHolderAndQuote(this.policyHolder, this.quotationNumber, this.quoteGeneratedDate),


        { text: 'Terms and Conditions', style: 'title', margin: [0, 20, 0, 5] },
        termsAndConditions1,

        this.premiumTable(this.premiumDetails, this.insurerUrl, [
          ...Object.keys(this.premiumDetails[0]).map((obj) => {
            return obj;
          }),
        ]),


        ...this.category.map((d) => {
          return { ...d };
        }),


        // ...this.exclusions.map((d) => {
        //   return { ...d };
        // }),


        { text: 'Terms and Conditions', style: 'title', pageBreak: 'before', margin: [0, 20, 0, 5] },
        termsAndConditions2,
        { text: `Ref Circular No. DOH/HPS/2024/1617, for all policies incepting on or after 1st of July, and as per DOH regulations, the regulator has mandated the new minimum premium to be applicable, and if our rates are lower than the minimum rates, then the new minimum rates shall be applicable.`, fontSize: 10, margin: [0, 10, 0, 10] },

        {
          text: 'Client Signature: _________________________________________',
          fontSize: 10,
          alignment: 'left',
          margin: [0, 30, 0, 5]
        },
        {
          text: 'Date: ________________________________________',
          fontSize: 10,
          alignment: 'left',
          margin: [0, 5, 0, 30]
        }
      ],
      styles: {
        headerLine1: {
          fontSize: 17,
          // bold: true,
        },
        headerLine2: {
          fontSize: 11,
          color: '#808080'

        },
        footerText: {
          fontSize: 10,
          color: '#888888',
        },
        title: { fontSize: 10, bold: true },
        ulList: {
          margin: [0, 10], // Optional: add space between list items
        },
        textLine: {
          fontsize: 10
        },


        company_details: {
          font: "Calibri",
          fontSize: 14,
          normal: true,
          margin: [0, 20, 0, 0],
        },
        categoryTitle: {
          fontSize: 10,
          color: "#FFFFFF",
          bold: true,
          fillColor: '#067084'
        },
        insuranceTtl: {
          fontSize: 12,
          fillColor: "#067084"
        },
        regularFont: {
          color: "#233253",
        },
        key: {
          font: "Calibri",
          fontSize: 12,
          bold: true,
          alignment: "justify",
          lineHeight: 1.5,
        },
        value: {
          font: "Calibri",
          fontSize: 12,
          normal: true,
          alignment: "justify",
          lineHeight: 1.5,
        },
      },
    };
    pdfMake.createPdf(docDefinition).download(`${this.CRN}.pdf`);
  }
}
