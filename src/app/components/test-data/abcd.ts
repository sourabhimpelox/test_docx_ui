import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@environment/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DistributorV1Service } from 'src/app/distributo-v1/service/distributor-v1.service';
import { SessionService } from 'src/app/session-service/session.service';
import { CommonService } from 'src/app/shared/common.service';
import { PdfService } from 'src/app/shared/pdf.service';
import * as moment from "moment";
import * as _ from "lodash";
import pdfMake from "pdfmake/build/pdfmake";
import { formatNumber } from '@angular/common';
import { pdfImages } from '../medgulf-pdf-images';
import { auto } from '@popperjs/core';
import { CursorError } from '@angular/compiler/src/ml_parser/lexer';
import { AlignmentType, Document, ImageRun, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, Header, Footer, SimpleField, BorderStyle, VerticalAlign, SectionType, PageBreak, TableLayoutType } from 'docx';
import { termsAndConditions, acceptanceAndAcknowledgment, NameAndSignature, policyInsuranceRequirement1, policyInsuranceRequirement2 } from './data';
import { PremiumDetail, Category, CensusCategory, Exclusion, EmirateData, PdfAgeBandDetail, agebandData, CellOptions } from './interfaces'
import { saveAs } from "file-saver";


// pdfMake.vfs = pdfFonts.pdfMake.vfs;
// pdfMake.fonts = {
//   // Default font should still be available

//   Verdana: {
//     normal: "Verdana-Regular.ttf",
//     bold: "Verdana-Bold.ttf",
//   }

// };

@Component({
  selector: 'app-quote-pdf',
  templateUrl: './quote-pdf.component.html',
  styleUrls: ['./quote-pdf.component.scss']
})
export class QuotePdfComponent implements OnInit {
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
  public ageBandDetails = [
    {
      "age": "0-5",
      "maternityCount": 0,
      "maternityTotalGrossPremium": 0,
      "Dependents": {
        "maleCount": 0,
        "femaleCount": 0,

        "maleGrossPremium": 0,
        "femaleGrossPremium": 0,
        "maternityGrossPremium": 0,
        "maleTotalGrossPremium": 0,
        "femaleTotalGrossPremium": 0

      },
      "Employee": {
        "maleCount": 0,
        "femaleCount": 0,
        "maleGrossPremium": 0,
        "femaleGrossPremium": 0,
        "maternityGrossPremium": 0,
        "maleTotalGrossPremium": 0,
        "femaleTotalGrossPremium": 0,
      }
    },
    {
      "age": "18-40",
      "maternityCount": 1,
      "maternityGrossPremium": 400,
      "maternityTotalGrossPremium": 400,

      "Dependents": {
        "maleCount": 3,
        "femaleCount": 2,
        "maleGrossPremium": 500,
        "femaleGrossPremium": 500,
        "maleTotalGrossPremium": 1500,
        "femaleTotalGrossPremium": 1000
      },
      "Employee": {
        "maleCount": 0,
        "femaleCount": 0,
        "maleGrossPremium": 0,
        "femaleGrossPremium": 0,
        "maleTotalGrossPremium": 0,
        "femaleTotalGrossPremium": 0
      }
    },
    {
      "age": "Total",
      "maternityCount": 1,
      "maternityGrossPremium": 300,
      "maternityTotalGrossPremium": 300,

      "Dependents": {
        "maleCount": 3,
        "femaleCount": 2,
        "maleGrossPremium": 500,
        "femaleGrossPremium": 500,
        "maleTotalGrossPremium": 1500,
        "femaleTotalGrossPremium": 1000
      },
      "Employee": {
        "maleCount": 0,
        "femaleCount": 0,
        "maleGrossPremium": 0,
        "femaleGrossPremium": 0,
        "maleTotalGrossPremium": 0,
        "femaleTotalGrossPremium": 0
      }
    },
  ]
  public isWord: boolean

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
      this.isWord = !!this.activeRoute.snapshot.queryParamMap.get("isWord")
      //this.redirectionUrl = `work-flow/quotes`;
      //UNCOMMENT THIS FOR Redirection to Quotes Flow ATUTOMATICALLY


      // Transform the response to Array used for create quote using  lodash.
      this.transformedResultResponse = await this.distributorV1Service.quoteDetails;

      let currentDate = new Date();
      this.todaydate = moment(currentDate).format("MMM DD YYYY");

      this.quoteGeneratedDate = moment(this.transformedResultResponse.companyDetails.quoteGeneratedDate).format("DD MMM YYYY");

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
      console.log("transformedResultResponse((((((((((((", this.transformedResultResponse)

      if (this.isWord) {
        await this.generateDocument(this.transformedResultResponse)
      } else {
        this.generatePdf(this.transformedResultResponse);
      }




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
        let grossPremiumTable: any;
        let totalGrossPremiumTable: any;

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
              table: {
                widths: [169, 169, 169],
                body: [],
              },
            };

            let riskType = quote.risk_type === "no" ? "" : "&" + " " + quote.risk_type.toUpperCase();
            quoteOptions.table.body.push([
              { text: `Quote ${i + 1}`, style: ["categoryTitle"] },
              { text: `${quote.quote_type.charAt(0).toUpperCase() + quote.quote_type.slice(1) + " " + "Quote"} ${riskType}  `, style: ["categoryTitle"] },
              {
                text:
                  `${this.transformedResultResponse?.quotes[0]?.currency} ` +
                  quote.option_premium.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }),
                style: ["categoryTitle"],
              },
            ]);

            //Premium and category table
            let categoryPremiumTable = {
              text: { text: "Categories & Premium ", style: ["categoryTitle"] },
              table: {
                widths: [180, 180],
                body: [],
              },
            };

            //Premium and category table
            let premiumSummaryTable = {
              text: { text: "Premium Summary", style: ["categoryTitle"] },
              table: {
                widths: [180, 180],
                body: [],
              },
            };

            //Benefits and Category table
            let categoryBenefitsTable = {
              text: { text: "Categories & Benefits", style: ["categoryTitle"] },
              table: {
                widths: [394, 394],
                body: [],
              },
            };

            quoteHeadersDisplay = { table: quoteOptions.table, margin: [0, 10, 0, 0], pageBreak: "before" };
            FinalPdf.push(quoteHeadersDisplay);

            let widths = [];
            if (quote.data.length == 1) {
              widths = [257, 257];
            } else if (quote.data.length === 2) {
              widths = [169, 169, 169];
            } else if (quote.data.length === 3) {
              widths = [124, 124, 124, 124];
            } else if (quote.data.length === 4) {
              widths = [100, 100, 100, 100, 100];
            } else if (quote.data.length === 5) {
              widths = [79, 79, 79, 79, 79, 79];
            } else if (quote.data.length === 6) {
              widths = [65, 65, 65, 65, 65, 65, 65];
            }


            /***** Start of Categories and premium section ****/

            //Premium details

            let orderedPremiumGroupsHeaders = this.pdfService.formPremiumDetails(quote.data);

            let PremiumOptions = {
              table: {
                widths: widths,
                body: [],
              },
            };

            //Applying style to the headers.
            const cates = quote.data.map((cat) => {
              return {
                text: cat.category_name,
                style: ["categoryTitle"],
              };
            });

            let premiumHeadings = [{ text: "Premium", style: ["categoryTitle"] }, ...cates];

            PremiumOptions.table.body.push(premiumHeadings);

            PremiumOptions.table.body = this.pdfService.formPremiumDetailsTable(orderedPremiumGroupsHeaders, quote.data, PremiumOptions, this.insurerUrl);

            categoryPremiumHeaders = { ...categoryPremiumTable.text, margin: [0, 10, 0, 0] };
            categoryPremiumValues = { fontSize: 9, table: PremiumOptions.table, margin: [0, 10, 0, 0] };
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

            benefitHeaders = { ...categoryBenefitsTable.text, margin: [0, 10, 0, 0] };
            benefitValues = { fontSize: 9, table: benefitOptions.table, margin: [0, 10, 0, 0] };
            FinalPdf.push(benefitHeaders, benefitValues);

            /***** End of Categories and Benefits section ****/

            await Promise.all(
              quote.data.map((category: any, index) => {
                if (category.census.length > 0) {
                  let categoryCensusTable = {
                    text: { text: `MAF Required Members - ${category.category_name}`, style: ["categoryTitle"] },
                    table: {
                      widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                      body: this.buildTableBody(category.census, category.census, this.transformedResultResponse),
                    },
                  };

                  censusHeaders = { ...categoryCensusTable.text, margin: [0, 10, 0, 0], pageBreak: "before" };
                  censusValues = { table: categoryCensusTable.table, margin: [0, 10, 0, 0] };

                  FinalPdf.push(censusHeaders, censusValues);
                }

                // Define the text and style for the category title
                let categoryTitle = {
                  text: `Age Band - ${category.data.emirates.emirates_name} - ${category.category_name}`,
                  style: ["categoryTitle"]
                };

                // Check if 'singleFemalePremiumDisplay' exists
                let isSingleFemalePremiumDisplay = category.data['age_values'][0].member['Employee'].hasOwnProperty('singleFemalePremiumDisplay') ||
                  category.data['age_values'][0].member['Dependents'].hasOwnProperty('singleFemalePremiumDisplay');

                let isMaternityFemalePremiumDisplay = (category.data['age_values'][0].member['Employee'].hasOwnProperty('singleFemalePremiumDisplay') ||
                  category.data['age_values'][0].member['Dependents'].hasOwnProperty('singleFemalePremiumDisplay')) && this.ageBandDetails;

                // Determine which table body to use based on the condition
                let tableBody;
                let widths;
                if (isSingleFemalePremiumDisplay) {
                  widths = [31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7],

                    tableBody = this.buildTableBody4(
                      category.data["age_values"],
                      category.data["age_values"],
                      `${this.transformedResultResponse?.quotes[0]?.currency} ${category.data.totalPremium.toLocaleString("en-US")}`,
                      `${category.data.totalMemberCount}`
                    );
                } else {
                  widths = [31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7, 31.7],

                    tableBody = this.buildTableBody3(
                      category.data["age_values"],
                      category.data["age_values"],
                      `${this.transformedResultResponse?.quotes[0]?.currency} ${category.data.totalPremium.toLocaleString("en-US")}`,
                      `${category.data.totalMemberCount}`
                    );

                }

                if (isMaternityFemalePremiumDisplay) {

                  const pageBreak = [
                    { text: '' },
                    { text: '' },
                    { text: '' },
                    { text: '' },
                    { text: '' },
                    { text: '', pageBreak: 'before' },
                  ];

                  widths = [80, 80, 80, 80, 80, 80];
                  // let tableBody = [];


                  if (category.data.emirates.emirates_name.trim().toLowerCase() === "dubai" && category.data.tpa.tpa_name.trim().toLowerCase() === "nextcare") {
                    // Unified table body
                    const unifiedTableBody = this.pdfService.unifyAgeBand(category.data.pdfAgeBandDetailsUnify);
                    tableBody = [...unifiedTableBody];
                  } else if (category.data.emirates.emirates_name.trim().toLowerCase() === "abu dhabi" && category.data.tpa.tpa_name.trim().toLowerCase() === "nextcare") {
                    // Unified table body for Abu Dhabi
                    widths = ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'];
                    const unifiedTableBody2 = this.pdfService.unifyAgeBand2(category.data.pdfAgeBandDetailsUnify);
                    tableBody = [...unifiedTableBody2];
                  } else {
                    // Member count
                    const memberCountTableBody = this.buildTableBody5(category.data.pdfAgeBandDetails, category.data.pdfAgeBandDetails);

                    // Optionally append or replace with another table body
                    const grossPremiumTableBody = this.buildTableBody6(category.data.pdfAgeBandDetails, category.data.pdfAgeBandDetails);

                    // Optionally append or replace with another table body
                    const totalGrossPremiumTableBody = this.buildTableBody7(category.data.pdfAgeBandDetails, category.data.pdfAgeBandDetails);

                    const spacerRow = [{ text: '', colSpan: widths.length, margin: [0, 3, 0, 0] }];

                    tableBody = [...memberCountTableBody, spacerRow, ...grossPremiumTableBody, spacerRow, ...totalGrossPremiumTableBody];
                  }
                }


                // Define the category premium table object
                let categoryPremiumTable = {
                  text: categoryTitle,
                  table: {
                    widths: widths,
                    body: tableBody
                  }
                };

                // Now you can use categoryPremiumTable to generate your PDF or further manipulate it


                // Age Band Table
                // let categoryPremiumTable = {
                //   text: { text: ` Age Band - ${category.data.emirates.emirates_name} -  ${category.category_name}`, style: ["categoryTitle"] },
                //   table: {
                //     widths: [80, 80, 80, 80, 80, 80],
                //     // body: category.data['age_values'][0].member['Employee'].hasOwnProperty('singleFemalePremiumDisplay') || category.data['age_values'][0].member['Dependents'].hasOwnProperty('singleFemalePremiumDisplay') ? this.buildTableBody4(category.data["age_values"], category.data["age_values"], `${this.transformedResultResponse?.quotes[0]?.currency} ${category.data.totalPremium.toLocaleString("en-US")}`, `${category.data.totalMemberCount}`) : this.buildTableBody3(category.data["age_values"], category.data["age_values"], `${this.transformedResultResponse?.quotes[0]?.currency} ${category.data.totalPremium.toLocaleString("en-US")}`, `${category.data.totalMemberCount}`),
                //     body:this.buildTableBody5(this.ageBandDetails,this.ageBandDetails),
                //   },
                //   table1: {
                //     widths: [80, 80, 80, 80, 80, 80],
                //     // body: category.data['age_values'][0].member['Employee'].hasOwnProperty('singleFemalePremiumDisplay') || category.data['age_values'][0].member['Dependents'].hasOwnProperty('singleFemalePremiumDisplay') ? this.buildTableBody4(category.data["age_values"], category.data["age_values"], `${this.transformedResultResponse?.quotes[0]?.currency} ${category.data.totalPremium.toLocaleString("en-US")}`, `${category.data.totalMemberCount}`) : this.buildTableBody3(category.data["age_values"], category.data["age_values"], `${this.transformedResultResponse?.quotes[0]?.currency} ${category.data.totalPremium.toLocaleString("en-US")}`, `${category.data.totalMemberCount}`),
                //     body:this.buildTableBody6(this.ageBandDetails,this.ageBandDetails),
                //   },
                //   table2: {
                //     widths: [80, 80, 80, 80, 80, 80],
                //     // body: category.data['age_values'][0].member['Employee'].hasOwnProperty('singleFemalePremiumDisplay') || category.data['age_values'][0].member['Dependents'].hasOwnProperty('singleFemalePremiumDisplay') ? this.buildTableBody4(category.data["age_values"], category.data["age_values"], `${this.transformedResultResponse?.quotes[0]?.currency} ${category.data.totalPremium.toLocaleString("en-US")}`, `${category.data.totalMemberCount}`) : this.buildTableBody3(category.data["age_values"], category.data["age_values"], `${this.transformedResultResponse?.quotes[0]?.currency} ${category.data.totalPremium.toLocaleString("en-US")}`, `${category.data.totalMemberCount}`),
                //     body:this.buildTableBody7(this.ageBandDetails,this.ageBandDetails),
                //   },
                //   // text1:{text:`Total - ${this.transformedResultResponse?.quotes[0]?.currency} ${category.data.totalPremium.toLocaleString("en-US")}`,style:["categoryTitle"]}
                // };

                premiumHeaders = { ...categoryPremiumTable.text, margin: [0, 5, 0, 0], pageBreak: "before" };
                memberCountTable = { table: categoryPremiumTable.table, margin: [0, 5, 0, 0] };
                // grossPremiumTable = { table: categoryPremiumTable.table1, margin: [0, 10, 0, 0] };
                // totalGrossPremiumTable = { table: categoryPremiumTable.table2, margin: [0, 10, 0, 0] };
                // premiumTotal = { ...categoryPremiumTable.text1, margin: [500, 10, 0, 0] };
                FinalPdf.push(premiumHeaders, memberCountTable);

              })
            );
            let summaryPremiumOptions = {
              table: {
                widths: widths,
                body: [],
              },
            };
            const cates1 = quote.data.map((cat) => {
              return {
                text: cat.category_name,
                style: ["summaryTable"],
              };
            });

            let summaryPremiumHeadings = [{ text: "Premium", style: ["summaryTable"] }, ...cates1];

            summaryPremiumOptions.table.body.push(summaryPremiumHeadings);

            summaryPremiumOptions.table.body = this.pdfService.formPremiumDetailsTable(orderedPremiumGroupsHeaders, quote.data, summaryPremiumOptions, this.insurerUrl);


            categoryPremiumHeaders = { ...premiumSummaryTable.text, margin: [0, 10, 0, 0] };
            categoryPremiumValues = {fontSize:9, table: summaryPremiumOptions.table, margin: [0, 10, 0, 0] };
            FinalPdf.push(categoryPremiumHeaders, categoryPremiumValues);
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
        category.data.premium_details.push({
          group_details: 'Premium',
          tob_header: 'Member count',
          tob_value:category.member_count
        });

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
        widths: [155.9, 155.9, 155.9, 155.9, 155.9],
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
      width: 900,
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
        fillColor: "#32CD32",
      },
      {
        text: "Employee Id",
        alignment: "center",
        bold: true,
        style: "header",
        fillColor: "#32CD32",
      },
      {
        text: "Employee Name",
        alignment: "center",
        bold: true,
        style: "header",
        fillColor: "#32CD32",
      },
      {
        text: "Relations",
        alignment: "center",
        bold: true,
        style: "header",
        fillColor: "#32CD32",
      },
      {
        text: "Age",
        alignment: "center",
        bold: true,
        style: "header",
        fillColor: "#32CD32",
      },
      // {
      //   text: "Premium",
      //   alignment: "center",
      //   bold: true,
      //   style: "header",
      //   fillColor: "#32CD32",
      // },
      {
        text: "Category",
        alignment: "center",
        bold: true,
        style: "header",
        fillColor: "#32CD32",
      },
      {
        text: "Member Type ",
        alignment: "center",
        bold: true,
        style: "header",
        fillColor: "#32CD32",
      },
    ]);

    data.forEach(function (row: any, index) {
      var dataRow: any = [];
      let finalUpdatedLoadedPremium = row?.updated_loaded_premium.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      dataRow.push({ text: index + 1, alignment: "center" }, { text: row?.employee_id, alignment: "center" }, { text: row?.employee_name, alignment: "center" }, { text: row?.relations, alignment: "center" }, { text: row?.age, alignment: "center" }, { text: row?.category, alignment: "center" }, { text: row?.member_type, alignment: 'center' });
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
          fillColor: "#B7B5CF",
          color: "#365d7c",
          bold: true,
          fontSize: 8
        },
        {
          text: "Employees",
          colSpan: 4,
          alignment: "center",
          fillColor: "#B7B5CF",
          color: "#365d7c",
          bold: true,
          fontSize: 8
        },
        {},
        {},
        {},
        {
          text: "Dependents",
          colSpan: 4,
          alignment: "center",
          fillColor: "#B7B5CF",
          color: "#365d7c",
          bold: true,
          fontSize: 8
        },
        {},
        {},
        {},
        {
          text: "Total",
          colSpan: 4,
          alignment: "center",
          fillColor: "#B7B5CF",
          color: "#365d7c",
          bold: true,
          fontSize: 8
        },
        {},
        {},
        {},
      ],
      [
        {
          text: "Age Band",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          rowSpan: 2,
          bold: true,
          fontSize: 8
        },
        {
          text: "Member Count",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          bold: true,
          colSpan: 2,
          fontSize: 8
        },
        {},
        {
          text: `Premium (${this.transformedResultResponse?.quotes[0]?.currency})`,
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          bold: true,
          colSpan: 2,
          fontSize: 8
        },
        {},
        {
          text: "Member Count",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          bold: true,
          colSpan: 2,
          fontSize: 8
        },
        {},
        {
          text: `Premium (${this.transformedResultResponse?.quotes[0]?.currency})`,
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          bold: true,
          colSpan: 2,
          fontSize: 8
        },
        {},
        {
          text: "Member Count",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          bold: true,
          colSpan: 2,
          fontSize: 8
        },
        {},
        {
          text: `Premium (${this.transformedResultResponse?.quotes[0]?.currency})`,
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          bold: true,
          colSpan: 2,
          fontSize: 8
        },
        {},
      ],
      [
        {},
        {
          text: "Male",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Male",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Male",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Male",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Male",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Male",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
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

      dataRow.push({ text: row?.age || "", alignment: "center", fontSize: 6 }, { text: row?.member?.Employee?.maleCount || "", alignment: "center", fontSize: 6 }, { text: row?.member?.Employee?.femaleCount || "", alignment: "center", fontSize: 6 }, { text: maleEmployeePremium, alignment: "center", fontSize: 6 }, { text: femaleEmployeePremium, alignment: "center", fontSize: 6 }, { text: row?.member?.Dependents?.maleCount || "", alignment: "center", fontSize: 6 }, { text: row?.member?.Dependents?.femaleCount || "", alignment: "center", fontSize: 6 }, { text: maleDependentsPremium, alignment: "center", fontSize: 6 }, { text: femaleDependentsPremium, alignment: "center", fontSize: 6 }, { text: row?.member?.maleMemberCount || "", alignment: "center", fontSize: 6 }, { text: row?.member?.femaleMemberCount || "", alignment: "center", fontSize: 6 }, { text: totalMale, alignment: "center", fontSize: 6 }, { text: totalFemale, alignment: "center", fontSize: 6 });
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
          fillColor: "#B7B5CF",
          color: "#365d7c",
          bold: true,
          fontSize: 8
        },
        {
          text: "Employees",
          colSpan: 3,
          alignment: "center",
          fillColor: "#B7B5CF",
          color: "#365d7c",
          bold: true,
          fontSize: 8
        },
        {},
        {},
        {
          text: "Dependents",
          colSpan: 3,
          alignment: "center",
          fillColor: "#B7B5CF",
          color: "#365d7c",
          bold: true,
          fontSize: 8
        },
        {},
        {},
        {
          text: "Total",
          colSpan: 6,
          alignment: "center",
          fillColor: "#B7B5CF",
          color: "#365d7c",
          bold: true,
          fontSize: 8
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
          fillColor: "#E7E5EF",
          color: "black",
          rowSpan: 2,
          bold: true,
          fontSize: 8
        },
        {
          text: `Premium (${this.transformedResultResponse?.quotes[0]?.currency})`,
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          bold: true,
          colSpan: 3,
          fontSize: 8
        },
        {},
        {},
        {
          text: `Premium (${this.transformedResultResponse?.quotes[0]?.currency})`,
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          bold: true,
          colSpan: 3,
          fontSize: 8
        },
        {},
        {},
        {
          text: "Member Count",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          bold: true,
          colSpan: 3,
          fontSize: 8
        },
        {},
        {},
        {
          text: `Premium (${this.transformedResultResponse?.quotes[0]?.currency})`,
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          bold: true,
          colSpan: 3,
          fontSize: 8
        },
        {},
        {}
      ],
      [
        {},
        {
          text: "Male",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Single Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Married Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Male",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Single Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Married Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Male",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Single Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Married Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Male",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Single Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Married Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
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

      dataRow.push({ text: row?.age || "", alignment: "center", fontSize: 6 }, { text: maleEmployeePremium, alignment: "center", fontSize: 6 }, { text: singleFemaleEmployeePremium, alignment: "center", fontSize: 6 }, { text: marriedFemaleEmployeePremium, alignment: "center", fontSize: 6 }, { text: maleDependentsPremium, alignment: "center", fontSize: 6 }, { text: singleFemaleDependentsPremium, alignment: "center", fontSize: 6 }, { text: marriedFemaleDependentsPremium, alignment: "center", fontSize: 6 }, { text: row?.member?.maleMemberCount || "", alignment: "center", fontSize: 6 }, { text: row?.member?.singleFemaleMemberCount || "", alignment: "center", fontSize: 6 }, { text: row?.member?.marriedFemaleMembeCount || "", alignment: "center", fontSize: 6 }, { text: totalMale, alignment: "center", fontSize: 6 }, { text: totalSingleFemale, alignment: "center", fontSize: 6 }, { text: totalMarriedFemale, alignment: "center", fontSize: 6 });

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

    var canvas = document.createElement('canvas');
    canvas.width = 200; // Width of the square
    canvas.height = 4; // Height of the square

    // Step 2: Draw a green square on the canvas
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#00587C'; // Green color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Step 3: Convert canvas to base64
    var base64Image = canvas.toDataURL('image/png');
    let docDefinition = {
      pageOrientation: "portrait",

      pageMargins: [20, 15, 30, 110],
      // pageMargins:[30, 60, 30, 60],
      header: function (currentPage, pageCount) {
        if (currentPage > 1) {
          return {
            columns: [
              {
                image: base64Image,
                width: 110,
                height: 13,
                margin: [30, 0, 0, 0],
                alignment: "left"
              },
              {
                text: currentPage - 1,
                fontSize: 8,
                margin: [40, 0, 0, 0],
                alignment: "left",
              }
            ]
          }
        }
        else {
          return {}
        }
      },

      footer: function (currentPage, pageCount) {

        if (currentPage < pageCount && currentPage > 2) {
          return {
            columns: [
              {
                // Left column
                stack: [],  // Adjusted bottom margin to 20 units
              },
              {
                // Left column
                stack: [
                  {
                    text: "*This is a system generated quote that does not require signature",
                    fontSize: 5,
                    alignment: "left",
                    margin: [23, 90, 0, 0]
                  },
                  {

                    text: "The Mediterranean & Gulf Insurance & Reinsurance Co. B.S.C ",
                    fontSize: 5,
                    alignment: "left",
                    margin: [30, 0, 0, 0]// Adjusted bottom margin to 20 units
                  },
                  {
                    text: "C.R. No: 1204528 - Insurance Authority No. 91",
                    fontSize: 5,
                    alignment: "left",
                    margin: [40, 0, 0, 0]
                  },
                ],
                color: "#ababab",
                alignment: "center",
                width: "*",
                margin: [0, 0, 0, 0]  // Adjusted bottom margin to 20 units
              },
              {
                // Right column

                stack: [

                  {
                    image: pdfImages.footerImg,
                    opacity: 0.5,
                    width: 180,
                    height: 100,
                    alignment: 'right',
                    margin: [20, 3, 0, 0]// Moved image 20 units higher (adjust as needed)
                  }

                ],
                alignment: "right",
                width: "*",
                margin: [0, 0, 0, 0] // Adjusted bottom margin to 20 units
              }
            ],
            margin: [0, 0, 0, 0] // Adjust overall footer margin to 20 units
          };
        } if (currentPage == 2) {
          return {
            stack: [
              {
                text: "Confidential, unpublished property of MEDGULF.Do not duplicate or distribute.",
                alignment: "center",
                margin: [10, 75, 10, 0],
                fontSize: 6.5,
                color: "#ababab",
              },
              {
                text: "Use and distribution is limited solely to authorized personnel.",
                alignment: "center",
                margin: [10, 0, 10, 0],
                fontSize: 6.5,
                color: "#ababab",
              }
            ]
          }
        }
        else if (pageCount == currentPage) {
          return {
            alignment: "center",
            margin: [0, 50, 0, 0],
            text: "Dubai Wharf Mall 1st Floor, Office DWR 22&23 Al Jaddaf Waterfront P.O. Box 30476, Dubai, UAE",
            fontSize: 11,
            color: "#00587C",
          }
        }
        else {
          return {}
        }


      },



      content: [
        {
          image: pdfImages.homeImg,
          margin: [0, -59, 0, 0],
          fit: [950, 700],
          pageBreak: 'after',
          alignment: 'center'
        },

        {
          image: pdfImages.homeImg1,
          fit: [900, 700],
          pageBreak: 'after',
          alignment: 'center',

        },
        {
          style: {
            fontSize: 9,
          },
          margin: [0, 15, 0, 0],
          table: {
            widths: [200, 'auto'],
            body: [
              [{ "text": 'Basic Details', "bold": true, color: "#00587C", fontSize: "12" }, ""],
              ["Client / Policy Holder Name", `${this.transformedResultResponse.companyDetails.company_name}`],
              ["Scheme Start Date/Renewal Date", `${moment(this.transformedResultResponse.censusDetails.policy_start_date).format("DD MMM YYYY")}`],
              ["Scope of Coverage", "As Per the Schedule of Benefits attached"],
              ["Premium payment warranty", "100% of inception premium is due and payable in advance or at the day of inception cover"],
              ["TPA name for Direct Billing", `${this.transformedResultResponse.quotes[0].data[0].data.tpa.tpa_name}`],
              [
                "Proposal Number ", ` ${this.CRN}/${transformedResultResponse.companyDetails?.version} `,
              ],
              ["Quote Generated Date", this.quoteGeneratedDate],
              ["Quote validity", "30 days from the quote generated date"],
              ["Other provision and & conditions", "Please refer to the Policy Wording document for definitions and the exclusion list"]
            ]
          }
        },
        { text: "Basic Details", fontSize: "12", color: "#FFFFFF", bold: true, alignment: 'center' }

        ,
        this.premiumTable(this.premiumDetails, [
          ...Object.keys(this.premiumDetails[0]).map((obj) => {
            return obj;
          }),
        ]),
        ...this.category.map((d) => {
          return { ...d };
        }),

        {
          text: "TERMS AND CONDITIONS",
          alignment: 'left',
          color: "#00587C",
          fontSize: 28.5,
          bold: true,
          width: 100,
          style: ['header', 'normalFont', "leftAlign"],
          margin: [0, 5, 0, 0],
          pageBreak: "before",

        },

        {
          margin: [0, 20, 0, 0],
          lineHeight: 1.5,
          style: ['normalFont'],
          fontSize: 9,
          ol: [
            { text: "Premium Payment Mode: In Advance." },
            { text: "All employees to be covered should be actively at work at the time of enrollment to the policy and holding valid Dubai residence visa. The offer provided is on compulsory basis for all employees" },
            { text: "Member Addition, Deletion & refunds if applicable will be calculated on prorata basis." },
            { text: "Policyholder shall update insurance immediately with any change of member status (addition, deletion & upgrade). Requests for back-dated additions/deletions shall not be honored by Insurance." },
            // { text: "NextCare TPA - PCP & RN3 Network (Outpatient treatment at PCP Clinics & IP treatment at RN3 Hospitals)." },
            { text: "This offer valid for 30 days from the date of issuance." },
            { text: "Cover is subject to the Company being informed and advised of any chronic or major illness or any diagnosed to develop into major conditions at the inception of the policy as well as on the addition of any member." },
            { text: "This offer shall be null & void in the event of misrepresentation, mis-description or non-disclosure of any materials facts pertaining to the proposal. Nondisclosure shall include non-intimation of any circumstances which may affect the insurance cover or our pricing" },
            { text: "Referral procedure: In respect of Essential Benefit Plan members, no costs incurred for advice, consultations or treatments provided by specialists or consultants without the insured first consulting a General Practitioner (or equiv alent as designated by DHA) who is licensed by DHA or another competent UAE authority will be payable by the insurer. The GP must make his referral together with reasons via the DHA e-Referrals system for the claim to be considered by the Insurer." },
            { text: "It is agreed and understood that providing the complete information as per the health authority requirements is the responsibility of the policy holder and  insurance will only prov ide the member card (if equivalent ) & certificate of insurance after receiving the mentioned information." },
            // { text: "This Plan is applicable only for Employees whose monthly salary is maximum AED 4,000/-. If any member is receiving salary more than AED 4000/- the same has to be notified to us." },
            { text: "The benefits offered in this quotation do not comply with the Health Authority Abu Dhabi regulation for compulsory insurance." },
            { text: "This offer shall be null & void if the Policyholder was previously insured by  Insurance under any scheme." },
            { text: "Pre-Existing and Chronic Conditions covered up to indemnity limit subject to 6 months waiting period for first scheme membership" },
            { text: "For this plan, there shall be no separate Health Card. Emirates ID shall be used as Health Card." },
            { text: "VAT(A): - Value Added Tax means any value added tax or similar tax payable to any authority in respect of transactions and includes, but without limitation, any other form of taxation that maybe applicable to this contract." },
            { text: "VAT (A1): All amounts expressed to be payable under this Insurance contract by the Insured to  Insurance Company (MEDGULF) which (in whole or in part) constitute the consideration for any insurance services for VAT purposes are deemed to be exclusive of any VAT which is chargeable on that Insurance serv ices, and accordingly if VAT is or becomes chargeable on any serv ices made by MEDGULF to Insured customer under this contract." },
            { text: "VAT (A2): MEDGULF is required to account to the relevant tax authority for VAT on that services, that insured customer must pay to MEDGULF (in addition to and at the same time as paying any other consideration for such serv ices or at the point the VAT becomes due to be paid by MEDGULF if earlier) an amount equal to the amount of that VAT (and MEDGULF must promptly provide an appropriate VAT invoice to that Insured customer where so required to by law)." },
            { text: "All quotations are subject to final approval from the MEDGULF Underwriting Team" },


          ]
        },


        ...this.exclusions.map((d) => {
          return { ...d };
        }),

        {
          text: "Acceptance of Proposal & \n Acknowledgment of Responsibilities",
          fontSize: 31,
          bold: true,
          color: "#00587C",
          style: ['header', 'normalFont', "leftAlign"],
          margin: [0, 5, 0, 0],
          pageBreak: "before"
        },
        {
          text: "I, the undersigned and duly authorized by my company hereby:",
          fontSize: 9,
          margin: [0, 10, 0, 0],
        },
        {
          margin: [10, 8, 10, 0],
          lineHeight: 1.5,
          style: ['normalFont'],
          fontSize: 9,
          ul: [
            { text: "Confirm knowledge and understanding of my responsibility, according to the Emirate of Dubai Health Insurance Law (No 11 of 2013) and all its subsequent circulars." },
            { text: "Confirm that failure to meet such responsibility will expose the company to violations, and at no point will MEDGULF be held liable for any breach from our side." },
            { text: "Confirm that all the information provided is true and accurate to the best of my knowledge." },
            { text: "Confirm that this policy will incept once the premium is paid as per agreed terms and upon providing MEDGULF with all requirements." },
            { text: "Confirm having read, understood and agreed on all the mentioned terms and conditions." },
            { text: "Confirm my acceptance of the submitted terms, based on the information provided in this proposal." },
          ]
        },

        { text: "Name:", margin: [0, 20, 0, 0], fontSize: 9, },
        { text: "Signature:", margin: [0, 7, 0, 0], fontSize: 9, },
        { text: "Email:", margin: [0, 7, 0, 0], fontSize: 9, },
        { text: "Contact Number:", margin: [0, 7, 0, 0], fontSize: 9, },
        { text: "Date:", margin: [0, 7, 0, 0], fontSize: 9, },
        { text: "Stamp:", margin: [0, 7, 0, 0], fontSize: 9, },
        {
          fontSize: 9,
          text: "Upon your confirmation, MEDGULF requires up to 5 working days from receipt of regulatory approvals along with all the below listed requirements:",
          margin: [0, 10, 0, 0],
        },


        ///policy///

        {
          text: "Policy Issuance Requirements",
          fontSize: 31,
          bold: true,
          color: "#00587C",
          style: ['header', 'normalFont', "leftAlign"],
          margin: [0, 5, 0, 0],
          pageBreak: "before"
        },

        {
          fontSize: 9,
          text: "Upon your confirmation, MEDGULF requires up to 5 working days from receipt of regulatory approvals along with all the below listed requirements:",
          margin: [0, 10, 0, 0],
        },
        {
          margin: [10, 8, 10, 0],
          lineHeight: 1.25,
          fontSize: 9,
          style: ['normalFont'],
          ul: [

            { text: "Signed & Stamped Proposal Form by Authorized Signatory." },
            { text: "BOR." },
            { text: "Establishment card." },
            { text: "TRN certificate." },
            { text: "Valid Trade License Copy & Relationship letter in case of having sister companies." },
            { text: "Updated members list in excel sheet format including mandatory data required by Dubai Health Authority: First Name, Second Name, Family Name, Contact Number (Recommended), Date of Birth, Gender, Relation, Nationality, Passport Number, Marital Status, Emirate (Emirate from which the visa is issued), Residential Location, Work Location, Salary Bracket (Less than AED 4,000 / Between AED 4,001 & AED 12,000 / Above AED 12,000), Commission, Emirates ID Number, UID Number, Entity type, Establishment ID, Entity Contact Number, Entity  Email ID and including:", },
            {
              margin: [10, 0, 0, 0],
              ul: [
                { text: "Marking of newcomers to Emirate of Dubai." },
                { text: "Marking of Members who did not have a DHA compliant plan." },
              ],
            },
            { text: "Passport Size Photographs linked to each member.", },
            { text: "Continuity Certificate (If Applicable) /Fines Receipt.", },
            { text: "Visa copies, passport copies & EID copies for each and every member (Applicable to SME only).", },
            { text: "Valid Emirates ID copy of authorized signatory.", },
            { text: "Name and contact details of the designated contact person.", },
            { text: "KYC (Know Your Customer) Form with all supporting documents.", },
            { text: "Bank Account details should be issued on the bank letterhead.", },
            { text: "Payment receipt as per agreed terms (VAT and Basmah to be added upfront).", },
            { text: "Passport & ID copies of the authorized personnel mentioned on the TL and the UBO (Ultimate Beneficiary Owner) if required.", },
          ]
        },
        {
          fontSize: 9,
          text: "Should any assistance be needed, please do not hesitate to contact us via:",
          margin: [0, 12, 0, 0],
        },
        {
          fontSize: 9,
          margin: [10, 13, 10, 0],
          ul: [
            { text: "800 (MEDGULF) – 800 (6334853)" },]
        },
        {

        },
        {
          image: pdfImages.pdfFooterImg,
          fit: [300, 300],
          pageBreak: 'before',
          alignment: 'center',
          margin: [0, 50, 0, 0]
        },

      ],



      styles: {
        header: {
          font: "Calibri",
        },
        summaryTable:{
          fillColor: "#B7B5CF",
          color: "#365d7c",
        },
        company_details: {
          font: "Calibri",
          fontSize: 14,
          normal: true,
          margin: [0, 20, 0, 0],
        },
        categoryTitle: {
          color: "#AC0233",
          bold: true,
        },
        insuranceTtl: {
          fontSize: 12,
          fillColor: "#E7E5EF",
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

  premiumTable(data: any, columns: any) {
    let widths;
    if (columns.length === 3) {
      widths = [169, 169, 169];
    } else if (columns.length === 4) {
      widths = [124, 124, 124, 124];
    } else if (columns.length === 5) {
      widths = [135, 135, 135, 135, 135];
    } else if (columns.length === 6) {
      widths = [111, 111, 111, 111, 111, 111];
    } else if (columns.length === 7) {
      widths = [93.7, 93.7, 93.7, 93.7, 93.7, 93.7, 93.7];
    }
    return {
      margin: [0, 10, 30, 30],
      table: {
        headerRows: 1,
        widths: widths,
        height: [20],
        body: this.pdfService.buildPremiumTableBody(data, this.insurerUrl, columns),
      },
      width: 900,
      style: {
        lineHeight: 1.2,
        fontSize: 6,
        font: "Calibri",
      },
    };
  }

  buildTableBody5(data, columns) {
    var body = [];

    body.push(
      [
        {
          text: "Age band",
          alignment: "center",
          fillColor: "#B7B5CF",
          color: "#365d7c",
          bold: true,
          fontSize: 8,
          rowSpan: 3
        },
        {
          text: "Member Count",
          colSpan: 5,
          alignment: "center",
          fillColor: "#B7B5CF",
          color: "#365d7c",
          bold: true,
          fontSize: 8
        },
        {},
        {},

        {},
        {}

      ],
      [
        {

        },
        {
          text: "Employees",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          bold: true,
          colSpan: 2,
          fontSize: 8
        },
        {},

        {
          text: "Dependents",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          bold: true,
          colSpan: 2,
          fontSize: 8
        },
        {},
        {
          text: "Maternity",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          rowSpan: 2,
          bold: true,
          fontSize: 8
        }


      ],
      [
        {},
        {
          text: "Male",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },

        {
          text: "Male",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {}

      ]
    );
    data.forEach(function (row: any) {
      var dataRow: any = [];
      dataRow.push({ text: row.age, fontSize: 8 }, { text: row['Employee'].maleCount, fontSize: 8 }, { text: row['Employee'].femaleCount, fontSize: 8 }, { text: row['Dependents'].maleCount, fontSize: 8 }, { text: row['Dependents'].femaleCount, fontSize: 8 }, { text: row.maternityCount, fontSize: 8 })

      body.push(dataRow);
    });
    body.map((obj, index) => {
      if (!obj) {
        body.splice(index, 1);
      }
    });
    return body;
  }

  buildTableBody6(data, columns) {
    let grossPremiumTable = JSON.parse(JSON.stringify(data)).filter(grossPremiumObj => { return grossPremiumObj.age.trim().toLowerCase() != 'total' });
    var body = [];

    body.push(
      [
        {
          text: "Age band",
          alignment: "center",
          fillColor: "#B7B5CF",
          color: "#365d7c",
          bold: true,
          fontSize: 8,
          rowSpan: 3
        },
        {
          text: "Gross Premium",
          colSpan: 5,
          alignment: "center",
          fillColor: "#B7B5CF",
          color: "#365d7c",
          bold: true,
          fontSize: 8
        },
        {},
        {},

        {},
        {}

      ],
      [
        {

        },
        {
          text: "Employees",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          bold: true,
          colSpan: 2,
          fontSize: 8
        },
        {},

        {
          text: "Dependents",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          bold: true,
          colSpan: 2,
          fontSize: 8
        },
        {},
        {
          text: "Maternity",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          rowSpan: 2,
          bold: true,
          fontSize: 8
        }


      ],
      [
        {},
        {
          text: "Male",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },

        {
          text: "Male",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {}

      ]
    );
    grossPremiumTable.forEach(function (row: any) {
      var dataRow: any = [];
      dataRow.push({ text: row.age, fontSize: 8 }, {
        text: row['Employee'].maleGrossPremium ? row['Employee'].maleGrossPremium.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) : 0, fontSize: 8
      }, {
        text: row['Employee'].femaleGrossPremium ? row['Employee'].femaleGrossPremium.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) : 0, fontSize: 8
      }, {
        text: row['Dependents'].maleGrossPremium ? row['Dependents'].maleGrossPremium.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) : 0, fontSize: 8
      }, {
        text: row['Dependents'].femaleGrossPremium ? row['Dependents'].femaleGrossPremium.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) : 0, fontSize: 8
      }, {
        text: row.maternityGrossPremium ? row?.maternityGrossPremium.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) : 0, fontSize: 8
      })

      body.push(dataRow);
    });
    body.map((obj, index) => {
      if (!obj) {
        body.splice(index, 1);
      }
    });
    return body;
  }

  buildTableBody7(data, columns) {
    var body = [];

    body.push(
      [
        {
          text: "Age band",
          alignment: "center",
          fillColor: "#B7B5CF",
          color: "#365d7c",
          bold: true,
          fontSize: 8,
          rowSpan: 3
        },
        {
          text: "Total Gross Premium",
          colSpan: 5,
          alignment: "center",
          fillColor: "#B7B5CF",
          color: "#365d7c",
          bold: true,
          fontSize: 8
        },
        {},
        {},

        {},
        {}

      ],
      [
        {

        },
        {
          text: "Employees",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          bold: true,
          colSpan: 2,
          fontSize: 8
        },
        {},

        {
          text: "Dependents",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          bold: true,
          colSpan: 2,
          fontSize: 8
        },
        {},
        {
          text: "Maternity",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          rowSpan: 2,
          bold: true,
          fontSize: 8
        }


      ],
      [
        {},
        {
          text: "Male",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },

        {
          text: "Male",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {
          text: "Female",
          alignment: "center",
          fillColor: "#E7E5EF",
          color: "black",
          fontSize: 8
        },
        {}

      ]
    );
    data.forEach(function (row: any) {
      var dataRow: any = [];
      dataRow.push({ text: row.age, fontSize: 8 }, {
        text: row['Employee'].maleTotalGrossPremium ? row['Employee'].maleTotalGrossPremium.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) : 0, fontSize: 8
      }, {
        text: row['Employee'].femaleTotalGrossPremium ? row['Employee'].femaleTotalGrossPremium.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) : 0, fontSize: 8
      }, {
        text: row['Dependents'].maleTotalGrossPremium ? row['Dependents'].maleTotalGrossPremium.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) : 0, fontSize: 8
      }, {
        text: row['Dependents'].femaleTotalGrossPremium ? row['Dependents'].femaleTotalGrossPremium.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) : 0, fontSize: 8
      }, {
        text: row.maternityTotalGrossPremium ? row.maternityTotalGrossPremium.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) : 0, fontSize: 8
      })

      body.push(dataRow);
    });
    body.map((obj, index) => {
      if (!obj) {
        body.splice(index, 1);
      }
    });
    return body;
  }


  // *****************************************WORD FILE DOWNLOAD**************************************************************
  totalCategoryCount: number = 0
  // categoey details table data 
  categoriesWithDetails(data: any[], quotes: any[], categoryKey = 'category') {
    const categoryCounts: Record<string, number> = data.reduce((acc: Record<string, number>, item: any) => {
      const category = item[categoryKey];
      if (category) {
        acc[category] = (acc[category] || 0) + 1;
      }
      return acc;
    }, {});

    this.totalCategoryCount = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);

    // Map the category counts and add details from quotes
    return Object.entries(categoryCounts).map(([categoryName, count]) => {
      categoryName = categoryName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const matchingQuote = quotes.find(
        (quote: any) => {
          return quote.category_name === categoryName;
        }
      );

      // Extract the "Total Premium" tob_value
      const totalPremiumValue = matchingQuote?.data.premium_details.find(
        (detail: any) => detail.tob_header === "Total Premium"
      )?.tob_value || null;

      return {
        categoryName: categoryName,
        members: count,
        option: totalPremiumValue, // Use the extracted value
      };
    });
  }

  // premium table data 
  PremiumTableData = (quoteData: any[]) => {
    return quoteData.map((category: any) => ({
      category_name: category.category_name,
      premium_details: category.data?.premium_details || category.premium_details || [],
    }));
  };

  // benifits table data 
  benefitsTableData = (data: any, benifitName: string) => {
    const organizedData: { [groupDetails: string]: any[] } = {};
    // Iterate through each category
    data.forEach((category: any) => {
      category.data[benifitName].forEach((benefit: any) => {
        const { group_details, tob_header, tob_value } = benefit;

        if (!organizedData[group_details]) {
          organizedData[group_details] = []; // Initialize array if not already
        }

        // Add benefits to the group details in the organized data
        organizedData[group_details].push({
          tob_header,
          category_name: category.category_name,
          tob_value,
        });
      });
    });
    return organizedData;
  };

  // age band table data 
  ageBandAndMafData(data: any[]) {
    return data.map(category => {
      return {
        category_name: category.category_name,
        pdfAgeBandDetails: category.data.pdfAgeBandDetails || [],
        pdfAgeBandDetailsUnify: category.data.pdfAgeBandDetailsUnify || [],
        census: category.census,
        emirate: category.data.emirates.emirates_name,
        tpa: category.data.tpa.tpa_name,
        ageValues: category.data.age_values,
        premium:`${category.currency} ${category.data.totalPremium}`,
        totalMemberCount:category.data.totalMemberCount
      }
    });
  }




  // exclusion data 
  formatExclusionData(exclusionData: any) {
    return exclusionData.map((item: any) => {
      return {
        emirates: item.emirates,
        exclusions: item.exclusion.map((exclusionItem: any) => {
          return {
            heading: exclusionItem.heading,
            bulletPoints: exclusionItem.bulletPoints,
            title: exclusionItem.title
          };
        }),
      };
    });
  }


  //****************************************************************** */
  // Create header content
  createHeader = () => {
    // Create a canvas programmatically for the green line image
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 4;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context.");
    }

    ctx.fillStyle = "#00587C";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Convert canvas to base64
    const base64Image = canvas.toDataURL("image/png");

    // Decode base64 to binary data
    const base64Data = base64Image.split(",")[1]; // Remove the "data:image/png;base64," prefix
    const binaryString = atob(base64Data);
    const binaryData = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      binaryData[i] = binaryString.charCodeAt(i);
    }

    // Create the header with the image and page numbers
    return new Header({
      children: [
        new Paragraph({
          children: [
            new ImageRun({
              data: binaryData, // Use binary data for the image
              transformation: {
                width: 110, // Image width
                height: 13, // Image height
              },
              type: "png",
            }),
            new TextRun({
              text: "  ", // Add a space after the image
            }),
            new TextRun({
              children: [new SimpleField("PAGE")], // Wrap the field in a TextRun
              size: 16, // Font size for the current page number
            }),
          ],
          spacing: {
            before: 0,
            after: 0,
          },
          alignment: AlignmentType.LEFT, // Align image and text to the left
        }),
      ],
    });
  };


  // Custome footer for other pages
  customFooter(text1: string, text2: string, text3: string, size: number, color: string): Footer {
    return new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: text1,
              font: "Calibri",
              color,
              size
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: text2,
              size, color,
              font: "Calibri",

            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: text3,
              size, color,
              font: "Calibri",
            }),
          ],
        }),
      ],
    });
  }
  //****************************************************************** */

  // Terms and Conditions Page 
  termsConditions = termsAndConditions.map((item, index) =>
    new Paragraph({
      children: [
        new TextRun({
          text: `${index + 1}. ${item.text}`,
          size: 20,
          font: "Calibri",

        }),
      ],
      spacing: { before: 50 },
      indent: { left: 360 },// Indents list items based on hierarchy level
    })
  );
  //****************************************************************** */
  // Acceptance and responsiblitites
  acceptance = acceptanceAndAcknowledgment.map(
    (item, index) =>
      new Paragraph({
        children: [
          new TextRun({
            text: `• ${item.text}`,
            size: 20,
            font: "Calibri",
          }),
        ],
        spacing: { before: 50 },
        indent: { left: 360 }
      })
  );

  nameAndSign = NameAndSignature.map(
    (item, index) =>
      new Paragraph({
        children: [
          new TextRun({
            text: `${item.text}`,
            size: 20,
            font: "Calibri",
          }),
        ],
        spacing: { before: 100 },
      })
  );

  //****************************************************************** */
  // Policy Issuance Requirements

  // Function to create the unordered list with optional nested items
  policyInsuranceRequirementList(ul: Array<{ text: string; ul?: Array<{ text: string }> }>) {
    const listItems = ul.map(item => {
      const paragraph = new Paragraph({
        children: [
          new TextRun({
            text: `• ${item.text}`,
            size: 20,
            font: "Calibri",
          }),
        ],
        spacing: { before: 50 },
        indent: { left: 360 }
      });

      // Check for nested unordered list (if exists)
      if (item.ul) {
        const nestedItems = item.ul.map(nestedItem => {
          return new Paragraph({
            children: [
              new TextRun({
                text: `       • ${nestedItem.text}`,
                size: 20,
                font: "Calibri",
              }),
            ],
            spacing: { before: 50 },
            indent: { left: 360 }
          });
        });
        return [paragraph, ...nestedItems];
      }
      return paragraph;
    });

    return listItems.flat();
  }


  //****************************************************************** */

  pageTitle(title: string, size: number = 57, color: string = "#00587C") {
    return new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size,
          color: color,
          font: "Calibri",
        }),
      ],
      heading: "Heading1",
      spacing: {
        after: 200,
      },
      alignment: 'left'
    });
  }

  // Exclusion section 
  createExclusionsSection = (data: EmirateData[]): Paragraph[] => {
    const paragraphs: Paragraph[] = [];

    data.forEach((emirateData: EmirateData, index: number) => {
      // Add a page break before each section (except the first one)
      if (index > 0) {
        paragraphs.push(
          new Paragraph({
            pageBreakBefore: true, // Starts a new page for this paragraph
          })
        );
      }

      // Add title for each section
      paragraphs.push(this.pageTitle("General Exclusions", 57, "00587C"));

      // Add Exclusions for each Emirate
      emirateData.exclusions.forEach((exclusion: Exclusion) => {
        // Add Heading for Exclusion
        let bold = exclusion.title === "title";
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: exclusion.heading, bold: bold, size: 20, font: "Calibri", }),
            ],
            spacing: { before: 50 },
            indent: { left: 360 },
          })
        );

        // Add Bullet Points for Exclusion (if any)
        if (exclusion.bulletPoints.length > 0) {
          exclusion.bulletPoints.forEach((bulletPoint: string) => {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `• ${bulletPoint}`, size: 20, font: "Calibri", }),
                ],
                spacing: { before: 50 },
                indent: { left: 360 },
              })
            );
          });
        }
      });
    });

    return paragraphs;
  };
  async generateDocument(quoteData) {


    const policyInsuranceRequirements1 = this.policyInsuranceRequirementList(policyInsuranceRequirement1);
    const policyInsuranceRequirements2 = this.policyInsuranceRequirementList(policyInsuranceRequirement2);

    // mostly used reusable snippets 
    // for images
    async function createImageFromBase64(base64Image: string, width: number, height: number): Promise<Paragraph> {
      // Decode base64 string to binary data
      const base64Data = base64Image.split(",")[1]; // Remove the prefix (e.g., "data:image/png;base64,")
      const binaryString = atob(base64Data); // Decode base64 to binary
      const binaryLength = binaryString.length;
      const uint8Array = new Uint8Array(binaryLength);

      for (let i = 0; i < binaryLength; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }

      // Return a paragraph containing the image
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: uint8Array, // Binary data for the image
            transformation: {
              width,
              height,
            },
            type: "png", // Specify the image format, adjust if needed
          }),
        ],
      });
    }


    // common cell for every table 
    function CommonCell(text: string, options: CellOptions = {}) {
      const {
        bold = false,
        fontSize = 9,
        fillColor = "#FFFFFF",
        color = "#000000",
        alignment = AlignmentType.LEFT,
        rowSpan,
        colSpan,
        width, // Optional width
      } = options;

      return new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: String(text),
                bold,
                size: fontSize * 2,
                color, font: "Calibri",

              }),
            ],
            alignment,
            indent: {
              left: 50,
            },
          }),
        ],
        rowSpan,
        columnSpan: colSpan,
        shading: {
          fill: fillColor,
        },
        width,
        // verticalAlign: VerticalAlign.CENTER, 
        borders: defaultBorders(10, 'single'), // Default borders
        margins: { left: 20, top: 20 },
      });
    }


    // borders for all tables 
    const defaultBorders = (size: number = 10, border: any = "single") => {
      return {
        top: { size: size, color: "000000", space: 0, style: border },
        bottom: { size: size, color: "000000", space: 0, style: border },
        left: { size: size, color: "000000", space: 0, style: border },
        right: { size: size, color: "000000", space: 0, style: border },
      };
    };


    // to create number of columns according to category 
    const totalColumns =
      quoteData.quotes[0].data.length + 1
    const columnWidth = 100 / totalColumns


    // title of each table 
    const tableTitle = (titleText: string, size: number = 26, color: string = '#AC0233') =>
      new Paragraph({
        children: [
          new TextRun({
            text: titleText,
            size,
            bold: true,
            color, font: "Calibri",
          }),
        ],
        spacing: { before: 200, after: 200 },
        alignment: 'left',
      });


    // title of each page 
    function pageTitle(title: string, size: number = 57, color: string = "#00587C") {
      return new Paragraph({
        children: [
          new TextRun({
            text: title,
            bold: true,
            size,
            color: color, font: "Calibri",
          }),
        ],
        heading: "Heading1",
        spacing: {
          after: 200,
        },
        alignment: 'left'
      });
    }

    // it gives space between two items 
    const spaceParagraph = new Paragraph({
      children: [
        new TextRun({
          text: " ", // Empty text to create space
          size: 1, // Small size to avoid visible text but still creating space
        }),
      ],
      spacing: { after: 200 }, // Adjust space between tables
    });


    // to add any line 
    function textLine(
      text: string,
      size: number = 18,
      before: number = 100,
      after: number = 100,
      alignment: any = AlignmentType.LEFT,// Default alignment to LEFT
      color?: string
    ): Paragraph {
      return new Paragraph({
        children: [
          new TextRun({
            text: text,
            size,
            color, font: "Calibri",
          }),
        ],
        spacing: { before, after },
        alignment, // Apply the alignment dynamically
      });
    }
    //****************************************************************** */

    let CRN: string =
      quoteData.companyDetails.client_reference_number
    let quoteGeneratedDate: string =
      quoteData.companyDetails.quoteGeneratedDate

    let basicTableData = [
      {
        label: 'Client / Policy Holder Name', value:
          quoteData.companyDetails.company_name
      },
      {
        label: 'Scheme Start Date/Renewal Date', value: moment(
          quoteData.censusDetails.policy_start_date).format('DD MMM YYYY')
      },
      { label: 'Scope of Coverage', value: 'As Per the Schedule of Benefits attached' },
      { label: 'Premium payment warranty', value: '100% of inception premium is due and payable in advance or at the day of inception cover' },
      {
        label: 'TPA name for Direct Billing', value:
          quoteData.quotes[0]?.data[0]?.data?.tpa?.tpa_name
      },
      {
        label: 'Proposal Number', value: `${CRN}/${quoteData.companyDetails?.version}`
      },
      { label: 'Quote Generated Date', value: moment(quoteGeneratedDate).format('DD MMM YYYY') },
      { label: 'Quote validity', value: '30 days from the quote generated date' },
      { label: 'Other provision and & conditions', value: 'Please refer to the Policy Wording document for definitions and the exclusion list' },
    ];


    //****************************************************************** */
    // Create footer content
    async function createFooter(imagePath: string): Promise<Footer> {
      // Fetch the image using createImage function
      const footerImage = await createImageFromBase64(imagePath, 220, 120);

      return new Footer({
        children: [
          new Table({
            rows: [
              new TableRow({
                children: [
                  // Empty cell for spacing or alignment
                  new TableCell({
                    children: [
                      textLine('', 10, 0, 0, AlignmentType.CENTER),
                    ],
                    width: { size: 33, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.BOTTOM,
                    margins: { top: 0, bottom: 0, left: 0, right: 0 },
                    borders: defaultBorders(0, 'none')
                  }),
                  // Centered text cell
                  new TableCell({
                    children: [
                      textLine('*This is a system-generated quote that does not require a signature', 10, 0, 0, AlignmentType.CENTER, '#ababab'),
                      textLine('The Mediterranean & Gulf Insurance & Reinsurance Co. B.S.C', 10, 0, 0, AlignmentType.CENTER, '#ababab'),
                      textLine('C.R. No: 1204528 - Insurance Authority No. 91', 10, 0, 0, AlignmentType.CENTER, '#ababab'),
                    ],
                    verticalAlign: VerticalAlign.BOTTOM,
                    width: { size: 34, type: WidthType.PERCENTAGE },
                    margins: { top: 0, bottom: 0, left: 0, right: 20 },
                    borders: defaultBorders(0, 'none')
                  }),
                  // Image cell
                  new TableCell({
                    children: [footerImage], // Add the image
                    width: { size: 33, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.BOTTOM,
                    margins: { top: 0, bottom: 0, left: 20, right: 0 },
                    borders: defaultBorders(0, 'none')
                  }),
                ],
              }),
            ],
            layout: TableLayoutType.FIXED,
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
          }),
        ],
      });
    }
    const footer = await createFooter(pdfImages.footerImg);


    //****************************************************************** */
    // Basic Table

    const createRow1 = (label: string, value: string | undefined) =>
      new TableRow({
        children: [
          CommonCell(label, { fontSize: 9, bold: false, width: { size: 35, type: "pct" } }),
          CommonCell(value || '', { fontSize: 9, bold: false, width: { size: 35, type: "pct" } }),
        ],
      });

    const basicTableRows = [
      new TableRow({
        children: [
          CommonCell('Basic Details', { color: "#00587C", fontSize: 10, bold: true, width: { size: 35, type: "pct" }, alignment: AlignmentType.LEFT }),
          CommonCell("", { fontSize: 6, bold: false, width: { size: 65, type: "pct" } })
        ],
      }),
      ...basicTableData.map(({ label, value }) => createRow1(label, value)),
    ];

    let basicDetailsTable = new Table({
      rows: basicTableRows,
      layout: TableLayoutType.FIXED,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
    });

    //****************************************************************** */
    // category member table 

    const createRow2 = (categoryName: string, members: number, option: string) =>
      new TableRow({
        children: [
          CommonCell(categoryName, { fontSize: 9, bold: false, width: { size: 33, type: "pct" } }),
          CommonCell(String(members), { fontSize: 9, bold: false, width: { size: 33, type: "pct" } }),
          CommonCell(option, { fontSize: 9, bold: false, width: { size: 34, type: "pct" } }),
        ],
      });

    let categoryData = this.categoriesWithDetails(
      quoteData.allCensusData,
      quoteData.quotes[0].data, 'category');

    const categoryMemberTableRows = [
      ...categoryData
        .sort((a, b) => {
          // Compare category names in alphabetical order
          if (a.categoryName < b.categoryName) return -1;
          if (a.categoryName > b.categoryName) return 1;
          return 0;
        })
        .map(({ categoryName, members, option }) => createRow2(categoryName, members, option)),
      // Add the "Total" row
      new TableRow({
        children: [
          CommonCell('Total', { fontSize: 9, bold: true, width: { size: 33, type: "pct" } }),
          CommonCell(String(this.totalCategoryCount), { fontSize: 9, bold: true, width: { size: 33, type: "pct" } }),
          CommonCell(`${quoteData.quotes[0].currency} ${quoteData.quotes[0].option_premium}`, { fontSize: 9, bold: true, width: { size: 34, type: "pct" } }),
        ],
      }),
    ];

    let categoriesDetailsTable = new Table({
      rows: [
        // Header row
        new TableRow({
          children: [
            CommonCell('Categories', { color: "#AC0233", fillColor: "#d5d5d5", fontSize: 9, bold: true, width: { size: 33, type: "pct" } }),
            CommonCell('Members', { color: "#AC0233", fillColor: "#d5d5d5", fontSize: 9, bold: true, width: { size: 33, type: "pct" } }),
            CommonCell('Option 1', { color: "#AC0233", fillColor: "#d5d5d5", fontSize: 9, bold: true, width: { size: 34, type: "pct" } }),
          ],
        }),
        // Dynamically created rows including the "Total" row
        ...categoryMemberTableRows,
      ],
      layout: TableLayoutType.FIXED,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
    });

    //****************************************************************** */
    // quote summary row 

    function createSummaryTable(quote: any): Table {
      return new Table({
        rows: [
          new TableRow({
            children: [
              CommonCell("Quote 1", { fontSize: 11, color: "#AC0233", bold: true, width: { size: 33, type: "pct" } }), // First column
              CommonCell(
                `${(quote.quote_type[0].toUpperCase()) + ((quote.quote_type).slice(1))} Quote${quote.risk_type.toLowerCase() === "no" ? "" : ` & ${(quote.risk_type).toUpperCase()}`}`,
                {
                  fontSize: 11,
                  bold: true,
                  color: "#AC0233",
                  width: { size: 34, type: "pct" }
                }
              ),
              CommonCell(`${quote.currency} ${quote.option_premium}`, { fontSize: 11, bold: true, color: "#AC0233", width: { size: 33, type: "pct" } }), // Third column
            ],
          }),
        ],
        layout: TableLayoutType.FIXED,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      });
    }

    const summaryTable = createSummaryTable(
      quoteData.quotes[0]);

    //****************************************************************** */
    // category and Premium table 

    const createRow3 = (tobHeader: string, values: string[]): TableRow =>
      new TableRow({
        children: [
          CommonCell(tobHeader, { fontSize: 10, bold: false, width: { size: columnWidth, type: "pct" } }), // First column for "Tob Header"
          ...values.map(value => CommonCell(value, { fontSize: 9, bold: false, width: { size: columnWidth, type: "pct" } })), // Other columns for categories
        ],
      });

    const createPremiumTableRows = (data: Category[], fontColor, bgColor): TableRow[] => {
      // Extract the tob_headers (unique keys in each category)
      const tobHeaders = data[0].premium_details.map((item: PremiumDetail) => item.tob_header);

      // First row is the header row (Tob Header and categories)
      const headerRow = new TableRow({
        children: [
          CommonCell('Premium', { fontSize: 10, bold: true, color: fontColor,fillColor:bgColor, width: { size: columnWidth, type: "pct" } }), // First column for "Tob Header"
          ...data.map(category => CommonCell(category.category_name,  { fontSize: 10, color: fontColor,fillColor:bgColor, bold: true, width: { size: columnWidth, type: "pct" } })), // Columns for categories
        ],
      });

      // Data rows: For each tob_header, create a row with values for each category
      const dataRows = tobHeaders.map((tobHeader: string) => {
        const values = data.map(category => {
          const premiumDetail = category.premium_details.find(
            (detail: PremiumDetail) => detail.tob_header === tobHeader
          );
          return premiumDetail ? premiumDetail.tob_value : ''; // Return tob_value if found, else empty string
        });
        return createRow3(tobHeader, values);
      });

      return [headerRow, ...dataRows];
    };
    let extractedData = this.PremiumTableData(
      quoteData.quotes[0].data);
    const premiumTableRows1 = createPremiumTableRows(extractedData, "#AC0233", "#FFFFFF");
    const premiumTableRows2 = createPremiumTableRows(extractedData, "#365d7c", "#B7B5CF");

    //****************************************************************** */
    // Category and Benifits table
    const createBenefitsTable = (organizedData: any) => {
      if (Object.keys(organizedData).length === 0) {
        return [];
      }

      const tables: any[] = [];

      // Create the header row for categories only once, before the group detail rows
      const headerRow = new TableRow({
        children: [
          CommonCell("Benefits", {
            fontSize: 10,
            color: "#AC0233",
            bold: true,
            width: { size: columnWidth, type: "pct" },
          }),

          ...Array.from(new Set(Object.values(organizedData).flatMap((benefitsForGroup: any) => benefitsForGroup.map((benefit: any) => benefit.category_name))))
            .map((categoryName) =>
              CommonCell(categoryName, {
                fontSize: 10,
                color: "#AC0233",
                bold: true,
                width: { size: columnWidth, type: "pct" }
              })
            ),
        ],
      });

      // Add headerRow once to the table
      tables.push(new Table({
        rows: [headerRow],
        layout: TableLayoutType.FIXED,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      }));

      // Loop through each group detail (e.g., "Policy Details")
      Object.keys(organizedData).forEach((groupDetail) => {
        const benefitsForGroup = organizedData[groupDetail];


        // Create group detail row with the group title, this will span all columns
        const groupDetailRow = new TableRow({
          children: [
            CommonCell(groupDetail, {
              fontSize: 10,
              bold: true,
              color: "#AC0233",
              width: { size: 100, type: "pct" },
              colSpan: 100 / columnWidth
            }),
          ],
        });

        // Create rows for each benefit
        const benefitRows: any[] = [];
        const benefitNames = Array.from(new Set(benefitsForGroup.map((benefit: any) => benefit.tob_header)));

        benefitNames.forEach((tob_header) => {
          const row = new TableRow({
            children: [
              CommonCell(String(tob_header), {
                fontSize: 10,
                bold: false,
                width: { size: columnWidth, type: "pct" },
              }),
              ...Array.from(new Set(benefitsForGroup.map((benefit: any) => benefit.category_name))).map((categoryName) => {
                // Find the benefit for the current category and benefit name
                const benefit = benefitsForGroup.find(
                  (b: any) => b.tob_header === tob_header && b.category_name === categoryName
                );
                return CommonCell(benefit && benefit.tob_value ? benefit.tob_value : "N/A", {
                  fontSize: 9,
                  bold: false,
                  width: { size: columnWidth, type: "pct" },
                });
              }),
            ],
          });
          benefitRows.push(row);
        });

        // Add group detail row and its benefit rows
        tables.push(
          new Table({
            rows: [groupDetailRow, ...benefitRows],
            // layout: TableLayoutType.FIXED,
            width: { size: 100, type: WidthType.PERCENTAGE },
          })
        );
      });

      return tables;
    };


    const mandatoryBenefitsData = this.benefitsTableData(
      quoteData.quotes[0].data, 'mandatory_benefits');
    const optionalBenefitsData = this.benefitsTableData(
      quoteData.quotes[0].data, 'optional_benefits');
    const mandatoryBenefitsTable = createBenefitsTable(mandatoryBenefitsData);
    const optionalBenefitsTable = createBenefitsTable(optionalBenefitsData);

    //****************************************************************** */

    const ageBandAndMafInfo = this.ageBandAndMafData(
      quoteData.quotes[0].data);


    function mafRiskTable(category: any): any[] {

      const rows: TableRow[] = [];

      const pageBreak = new Paragraph({
        children: [],
        pageBreakBefore: true,
      });

      // Add Table Header
      rows.push(
        new TableRow({
          children: [

            CommonCell("S.No", { fontSize: 10, bold: true, width: { size: 8, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
            CommonCell("Employee Id", { fontSize: 10, bold: true, width: { size: 14, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
            CommonCell("Employee Name", { fontSize: 10, bold: true, width: { size: 28, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
            CommonCell("Relations", { fontSize: 10, bold: true, width: { size: 14, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
            CommonCell("Age", { fontSize: 10, bold: true, width: { size: 8, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
            CommonCell("Category", { fontSize: 10, bold: true, width: { size: 14, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
            CommonCell("Member Type", { fontSize: 10, bold: true, width: { size: 14, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
          ],
        })
      );

      // Add Census Data Rows
      category.census.forEach((census: any, index: number) => {
        rows.push(
          new TableRow({
            children: [
              CommonCell((index + 1).toString(), { fontSize: 10, bold: false, width: { size: 8, type: "pct" }, alignment: AlignmentType.CENTER }),
              CommonCell(String(census.employee_id), { fontSize: 10, bold: false, width: { size: 14, type: "pct" }, alignment: AlignmentType.CENTER }),
              CommonCell(census.employee_name, { fontSize: 10, bold: false, width: { size: 28, type: "pct" }, alignment: AlignmentType.CENTER }),
              CommonCell(census.relations, { fontSize: 10, bold: false, width: { size: 14, type: "pct" }, alignment: AlignmentType.CENTER }),
              CommonCell(census.age.toString(), { fontSize: 10, bold: false, width: { size: 8, type: "pct" }, alignment: AlignmentType.CENTER }),
              CommonCell(census.category, { fontSize: 10, bold: false, width: { size: 14, type: "pct" }, alignment: AlignmentType.CENTER }),
              CommonCell(census.member_type, { fontSize: 10, bold: false, width: { size: 14, type: "pct" }, alignment: AlignmentType.CENTER }),
            ],
          })
        );
      });

      let title = pageTitle(`MAF Required Members - ${category.category_name}`, 24, '#AC0233')

      // Create Table
      const table = new Table({
        rows,
        layout: TableLayoutType.FIXED,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      });

      return [pageBreak, title, table]
    }


    //****************************************************************** */
    // Age band Tables 

    function checkSingleFemalePremiumDisplay(arr) {
      if (arr.length === 0) return false; // Return false if the array is empty

      const firstObject = arr[0];
      const { Dependents, Employee } = firstObject.member || {};

      // Check Dependents or Employee for singleFemalePremiumDisplay
      return (
        (Dependents?.singleFemalePremiumDisplay !== undefined) ||
        (Employee?.singleFemalePremiumDisplay !== undefined)
      );
    }

    const ageBandTables = ageBandAndMafInfo.map((category, index) => {
      let ageBandTable
      const content = [];

      // Check if MAF data is available for the category
      if (category.census && category.census.length > 0) {
        const mafTable = mafRiskTable(category);
        content.push(...mafTable);
      }


      let isSingleFemalePremiumDisplayExist = checkSingleFemalePremiumDisplay(category.ageValues)

      let isMaternityFemalePremiumDisplayExist = checkSingleFemalePremiumDisplay(category.ageValues) && this.ageBandDetails



      if (isSingleFemalePremiumDisplayExist) {
        ageBandTable = AgeBandTable4(category,category.premium, category.totalMemberCount)
      } else {
        ageBandTable = AgeBandTable5(category,category.premium, category.totalMemberCount)
      }

      if (isMaternityFemalePremiumDisplayExist) {
        if (category.emirate.trim().toLowerCase() === "dubai" && category.tpa.trim().toLowerCase() === "nextcare") {
          ageBandTable = AgeBandTable2(category)
        } else if (category.emirate.trim().toLowerCase() === "abu dhabi" && category.tpa.trim().toLowerCase() === "nextcare") {
          ageBandTable = AgeBandTable3(category)
        } else {
          ageBandTable = AgeBandTable1(category);
        }
      }

      content.push(...ageBandTable);

      return content;
    });

    // age band table type 1
    function AgeBandTable1(category: any) {

      const pageBreak = new Paragraph({
        children: [],
        pageBreakBefore: true,
      });

      const title = pageTitle(`Age Band - ${category.emirate} - ${category.category_name}`, 26, '#AC0233');

      // Create reusable tables
      const memberCountTable = createCategoryTable(
        category.category_name,
        "Member Count",
        "memberCount",
        category.pdfAgeBandDetails
      );

      const grossPremiumTable = createCategoryTable(
        category.category_name,
        "Gross Premium",
        "grossPremium",
        category.pdfAgeBandDetails
      );

      const totalGrossPremiumTable = createCategoryTable(
        category.category_name,
        "Total Gross Premium",
        "totalGrossPremium",
        category.pdfAgeBandDetails
      );

      return [pageBreak, title, memberCountTable, grossPremiumTable, totalGrossPremiumTable];
    }

    function createCategoryTable(
      categoryName: string,
      titleText: string,
      tableType: "memberCount" | "grossPremium" | "totalGrossPremium",
      details: any[]
    ): Table {
      // Title for the section
      const title = tableTitle(`${titleText} - ${categoryName}`, 26, "#AC0233");

      // Header Rows for the table
      const headers: TableRow[] = [
        new TableRow({
          children: [
            CommonCell("Age band", {
              fillColor: "#B7B5CF",
              color: "#365d7c",
              bold: true,
              fontSize: 8,
              rowSpan: 3,
              alignment: AlignmentType.CENTER
            }),
            CommonCell(
              tableType === "memberCount" ? "Member Count" :
                tableType === "grossPremium" ? "Gross Premium" : "Total Gross Premium",
              { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, colSpan: 5, alignment: AlignmentType.CENTER }
            ),
          ],
        }),
        new TableRow({
          children: [
            CommonCell("Employees", {
              fillColor: "#E7E5EF",
              bold: true,
              fontSize: 8,
              colSpan: 2,
              alignment: AlignmentType.CENTER
            }),
            CommonCell("Dependents", {
              fillColor: "#E7E5EF",
              bold: true,
              fontSize: 8,
              colSpan: 2,
              alignment: AlignmentType.CENTER
            }),
            CommonCell("Maternity", {
              fillColor: "#E7E5EF",
              bold: true,
              fontSize: 8,
              rowSpan: 2,
              alignment: AlignmentType.CENTER
            }),
          ],
        }),
        new TableRow({
          children: [
            CommonCell("Male", { fillColor: "#E7E5EF", fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell("Female", { fillColor: "#E7E5EF", fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell("Male", { fillColor: "#E7E5EF", fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell("Female", { fillColor: "#E7E5EF", fontSize: 8, alignment: AlignmentType.CENTER }),
          ],
        }),
      ];

      // Add data rows based on the details provided
      const dataRows: TableRow[] = details.map((row: any) => {
        const type = tableType === "memberCount" ? "Count" :
          tableType === "grossPremium" ? "GrossPremium" : "TotalGrossPremium";

        return new TableRow({
          children: [
            CommonCell(row.age, { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(type === "Count" ? row.Employee[`male${type}`] : row.Employee[`male${type}`].toFixed(2), { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(type === "Count" ? row.Employee[`female${type}`] : row.Employee[`female${type}`].toFixed(2), { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(type === "Count" ? row.Dependents[`male${type}`] : row.Dependents[`male${type}`].toFixed(2), { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(type === "Count" ? row.Dependents[`female${type}`] : row.Dependents[`female${type}`].toFixed(2), { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(type === "Count" ? row[`maternity${type}`] : row[`maternity${type}`].toFixed(2), { fontSize: 8, alignment: AlignmentType.CENTER }),
          ],
        });
      });

      // Add an empty row at the end
      if (tableType === "memberCount" || tableType === "grossPremium") {
        dataRows.push(
          new TableRow({
            children: [CommonCell("", { colSpan: 6, fontSize: 8, alignment: AlignmentType.CENTER })],
          })
        );
      }

      // Create the table
      const table = new Table({
        rows: [...headers, ...dataRows],
        layout: TableLayoutType.FIXED,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
      });

      return table;
    }

    // age band table type 2
    function AgeBandTable2(category: any) {
      let details = category.pdfAgeBandDetailsUnify;
      const pageBreak = new Paragraph({
        children: [],
        pageBreakBefore: true,
      });

      const title = pageTitle(`Age Band - ${category.emirate} - ${category.category_name}`, 26, '#AC0233');

      const headers = [
        new TableRow({
          children: [
            CommonCell("Age bracket", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, rowSpan: 3, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Dubai", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, colSpan: 5, width: { size: 16.67 * 5, type: "pct" }, alignment: AlignmentType.CENTER }),
          ],
        }),
        new TableRow({
          children: [
            CommonCell("Member Count", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 2, width: { size: 16.67 * 2, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Gross Premium per member", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 2, width: { size: 16.67 * 2, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Total Gross Premium", { fillColor: "#E7E5EF", bold: true, fontSize: 8, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          ],
        }),
        new TableRow({
          children: [
            CommonCell("Employees & Dependents", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Maternity Eligible", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Employees & Dependents excl. Maternity", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Maternity Premium Per Eligible Female", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Total", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          ],
        }),
      ];

      // Add data rows based on the details provided
      const dataRows: TableRow[] = details.map((row: any) => {
        return new TableRow({

          children: [
            CommonCell(row.age, { fontSize: 8, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell(row.members_count, { fontSize: 8, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell(row.maternity_count, { fontSize: 8, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell(row.members_gross_premium, { fontSize: 8, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell(row.maternity_gross_premium, { fontSize: 8, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell(row.total_gross_premium, { fontSize: 8, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          ],
        });
      });

      // Total row
      let totalMembersCount = 0;
      let totalMaternityCount = 0;
      let weightedSumGrossPremium = 0;
      let totalMaternityGrossPremium = 0;
      let totalGrossPremium = 0;

      details.forEach((row: any) => {
        totalMembersCount += row.members_count || 0;
        totalMaternityCount += row.maternity_count || 0;
        weightedSumGrossPremium += (row.members_count || 0) * (row.members_gross_premium || 0);
        totalMaternityGrossPremium += (row.maternity_count || 0) * (row.maternity_gross_premium || 0);
        totalGrossPremium += row.total_gross_premium || 0;
      });

      const totalMembersGrossPremium = totalMembersCount > 0
        ? (weightedSumGrossPremium / totalMembersCount).toFixed(2)
        : '0';
      const maternityGrossPremiumPerMember = totalMaternityCount > 0
        ? (totalMaternityGrossPremium / totalMaternityCount).toFixed(2)
        : '0';

      const totalRow = new TableRow({
        children: [
          CommonCell("Total", { fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          CommonCell(String(totalMembersCount), { fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          CommonCell(String(totalMaternityCount), { fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          CommonCell(totalMembersGrossPremium, { fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          CommonCell(maternityGrossPremiumPerMember, { fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          CommonCell(totalGrossPremium.toFixed(2), { fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
        ],
      });

      // Create the table for Member Count
      const memberCountTable = new Table({
        rows: [...headers, ...dataRows, totalRow],
        layout: TableLayoutType.FIXED,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        }
      });

      return [pageBreak, title, memberCountTable];
    }

    // age band table type 3
    function AgeBandTable3(category: any) {
      let details = category.pdfAgeBandDetailsUnify;
      const pageBreak = new Paragraph({
        children: [],
        pageBreakBefore: true,
      });

      const title = pageTitle(`Age Band - ${category.emirate} - ${category.category_name}`, 26, '#AC0233');

      const headers = [
        new TableRow({
          children: [
            CommonCell("Age bracket", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, rowSpan: 3, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Abhu Dhabi", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, colSpan: 10, width: { size: 9.09 * 10, type: "pct" }, alignment: AlignmentType.CENTER }),
          ],
        }),
        new TableRow({
          children: [
            CommonCell("Member Count", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 3, width: { size: 9.09 * 3, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Gross Premium per member", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 3, width: { size: 9.09 * 3, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Total Gross Premium", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 4, width: { size: 9.09 * 3, type: "pct" }, alignment: AlignmentType.CENTER }),
          ],
        }),
        new TableRow({
          children: [
            CommonCell("Employees", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Dependents", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Maternity", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Employees", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Dependents", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Maternity", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Employees", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Dependents", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Maternity", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell("Total", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          ],
        }),
      ];

      // Add data rows based on the details provided
      // Add data rows based on the details provided
      const dataRows: TableRow[] = details.map((row: any) => {
        return new TableRow({

          children: [
            CommonCell(row.age || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell(row.employee_count || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell(row.dependent_count || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell(row.maternity_count || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell(row.employee_gross_premium || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell(row.dependent_gross_premium || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell(row.maternity_gross_premium || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell((row.employee_gross_premium * row.employee_count).toFixed(2) || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell((row.dependent_gross_premium * row.dependent_count).toFixed(2) || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell((row.maternity_gross_premium * row.maternity_count).toFixed(2) || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
            CommonCell(((row.employee_gross_premium * row.employee_count) + (row.dependent_gross_premium * row.dependent_count) + (row.maternity_gross_premium * row.maternity_count)).toFixed(2) || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          ],
        });
      });

      // total row 
      let totalEmployeesCount = 0;
      let totalDependentsCount = 0;
      let totalMaternityCount = 0;
      let employeeGrossPremiumPerMember = 0;
      let dependentGrossPremiumPerMember = 0;
      let maternityGrossPremiumPerMember = 0;
      let employeeTotalGrossPremium = 0;
      let dependentTotalGrossPremium = 0;
      let maternityTotalGrossPremium = 0;
      let totalGrossPremium = 0;
      details.forEach((row: any) => {
        totalEmployeesCount += row.employee_count || 0;
        totalDependentsCount += row.dependent_count || 0;
        totalMaternityCount += row.maternity_count || 0;
        employeeTotalGrossPremium += (row.employee_count * row.employee_gross_premium) || 0;
        dependentTotalGrossPremium += (row.dependent_count * row.dependent_gross_premium) || 0;
        maternityTotalGrossPremium += (row.maternity_count * row.maternity_gross_premium) || 0;
        totalGrossPremium += ((row.employee_count * row.employee_gross_premium) + (row.dependent_count * row.dependent_gross_premium) + (row.maternity_count * row.maternity_gross_premium)) || 0;
      });
      employeeGrossPremiumPerMember = employeeTotalGrossPremium / totalEmployeesCount;
      dependentGrossPremiumPerMember = dependentTotalGrossPremium / totalDependentsCount;
      maternityGrossPremiumPerMember = maternityTotalGrossPremium / totalMaternityCount;


      const totalRow = new TableRow({
        children: [
          CommonCell("Total", { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          CommonCell(String(totalEmployeesCount) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          CommonCell(String(totalDependentsCount) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          CommonCell(String(totalMaternityCount) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          CommonCell(employeeGrossPremiumPerMember.toFixed(2) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          CommonCell(dependentGrossPremiumPerMember.toFixed(2) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          CommonCell(maternityGrossPremiumPerMember.toFixed(2) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          CommonCell(employeeTotalGrossPremium.toFixed(2) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          CommonCell(dependentTotalGrossPremium.toFixed(2) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          CommonCell(maternityTotalGrossPremium.toFixed(2) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          CommonCell(totalGrossPremium.toFixed(2) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
        ],
      });


      // Create the table for Member Count
      const memberCountTable2 = new Table({
        rows: [...headers, ...dataRows, totalRow],
        layout: TableLayoutType.FIXED,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      });

      return [pageBreak, title, memberCountTable2];
    }

    // age band table type 4
    function AgeBandTable5(category,premium, member) {
      let details = category.ageValues
      const pageBreak = new Paragraph({
        children: [],
        pageBreakBefore: true,
      });

      const title = pageTitle(`Age Band - ${category.emirate} - ${category.category_name}`, 26, '#AC0233');

      const headers = [
        new TableRow({
          children: [
            CommonCell("Age Band", { bold: true,fontSize: 8, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, rowSpan: 3 }),
            CommonCell("Employees", { bold: true,fontSize: 8, colSpan: 4, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER }),
            CommonCell("Dependents", { bold: true,fontSize: 8, colSpan: 4, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER }),
            CommonCell("Total", { bold: true,fontSize: 8, colSpan: 4, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER }),
          ],
        }),
        new TableRow({
          children: [
            CommonCell("Member Count", { bold: true,fontSize: 8, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 2 }),
            CommonCell(`Premium ${quoteData.quotes[0]?.currency}`, { bold: true,fontSize: 8, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 2 }),
            CommonCell("Member Count", { bold: true,fontSize: 8, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 2 }),
            CommonCell(`Premium ${quoteData.quotes[0]?.currency}`, { bold: true,fontSize: 8, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 2 }),
            CommonCell("Member Count", { bold: true,fontSize: 8, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 2 }),
            CommonCell(`Premium ${quoteData.quotes[0]?.currency}`, { bold: true,fontSize: 8, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 2 }),
          ],
        }),
        new TableRow({
          children: [
            CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          ],
        }),
      ];

      const dataRows: TableRow[] = details.map((row: any) => {
 
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
  

        return new TableRow({
          children: [
            CommonCell(row.age || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(row?.member?.Employee?.maleCount|| '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell( row?.member?.Employee?.femaleCount|| '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(maleEmployeePremium || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(femaleEmployeePremium || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(row?.member?.Dependents?.maleCount || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(row?.member?.Dependents?.femaleCount || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(maleDependentsPremium || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(femaleDependentsPremium|| '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(row?.member?.maleMemberCount|| '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(row?.member?.femaleMemberCount || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(totalMale|| '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(totalFemale|| '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          ],
        });
      });


      const totalRow = new TableRow({
        children: [
          CommonCell("Total", { bold: true, alignment: AlignmentType.CENTER, colSpan: 9 }),
          CommonCell(`Members ${member}`, {bold:true, alignment: AlignmentType.CENTER, colSpan: 2 }),
          CommonCell(`Premium : ${premium}`, { bold: true, alignment: AlignmentType.CENTER, colSpan: 2 }),

        ],
      });


      // Create the table for Member Count
      const memberCountTable2 = new Table({
        rows: [...headers, ...dataRows, totalRow],
        layout: TableLayoutType.FIXED,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      });

      return [pageBreak, title, memberCountTable2];

    }

    function AgeBandTable4(category: any,premium,member) {
      let details = category.ageValues
      const pageBreak = new Paragraph({
        children: [],
        pageBreakBefore: true,
      });

      const title = pageTitle(`Age Band - ${category.emirate} - ${category.category_name}`, 26, '#AC0233');

      const headers = [
        new TableRow({
          children: [
            CommonCell("Age Band", { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, rowSpan: 3 }),
            CommonCell("Employees", { bold: true, colSpan: 3, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER }),
            CommonCell("Dependents", { bold: true, colSpan: 3, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER }),
            CommonCell("Total", { bold: true, colSpan: 6, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER }),
          ],
        }),
        new TableRow({
          children: [
            CommonCell(`Premium ${quoteData.quotes[0]?.currency}`, { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 3 }),
            CommonCell(`Premium ${quoteData.quotes[0]?.currency}`, { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 3 }),
            CommonCell("Member Count", { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 3 }),
            CommonCell(`Premium ${quoteData.quotes[0]?.currency}`, { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 3 }),

          ],
        }),
        new TableRow({
          children: [
            CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Single Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Married Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Single Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Married Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Single Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Married Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Single Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
            CommonCell("Married Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          ],
        }),
      ];

      

      // Add data rows based on the details provided
      // Add data rows based on the details provided
      const dataRows: TableRow[] = details.map((row: any) => {
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
        return new TableRow({
          children: [
            CommonCell(row.age || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(maleEmployeePremium|| '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(singleFemaleEmployeePremium || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(marriedFemaleEmployeePremium || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(maleDependentsPremium || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(singleFemaleDependentsPremium || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(marriedFemaleDependentsPremium || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(row?.member?.maleMemberCount || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(row?.member?.singleFemaleMemberCount|| '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(row?.member?.marriedFemaleMembeCount|| '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(totalMale || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(totalSingleFemale|| '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(totalMarriedFemale|| '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          ],
        });
      });


      const totalRow = new TableRow({
        children: [
          CommonCell("Total", { bold: true, alignment: AlignmentType.CENTER, colSpan: 7 }),
          CommonCell(`Members ${member}`, {bold:true, alignment: AlignmentType.CENTER, colSpan: 3 }),
          CommonCell(`Premium : ${premium}`, { bold: true, alignment: AlignmentType.CENTER, colSpan: 3 }),

        ],
      });




      // Create the table for Member Count
      const memberCountTable2 = new Table({
        rows: [...headers, ...dataRows, totalRow],
        layout: TableLayoutType.FIXED,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      });

      return [pageBreak, title, memberCountTable2];
    }

    let exclusionData = this.formatExclusionData(quoteData.exclusion)
    let exclusion = this.createExclusionsSection(exclusionData)






    //****************************************************************** */

    // Create the Word document
    const doc = new Document({
      sections: [
        // 1st Page 
        {
          children: [await createImageFromBase64(pdfImages.homeImg, 595, 800)],
        },
        // 2nd page 
        {
          children: [await createImageFromBase64(pdfImages.homeImg1, 595, 750)],
          headers: {
            default: this.createHeader(),
          },
          footers: {
            default: this.customFooter("Confdential, unpublished property of MEDGULF.Do not duplicate or distribute.", "Use and distribution is limited solely to authorized personnel.", "", 13, "#ababab"),
          }
        },
        // 3rd page 
        {
          children: [
            basicDetailsTable,
            spaceParagraph,
            categoriesDetailsTable
          ],
          headers: {
            default: this.createHeader(),
          },
          footers: {
            default: footer
          }
        },
        // 4th page
        {
          children: [
            summaryTable,
            tableTitle("Categories & Premium", 26, '#AC0233'),
            new Table({
              rows: premiumTableRows1,
              layout: TableLayoutType.FIXED,
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
            }),
            tableTitle("Categories & Benefits", 26, '#AC0233'),
            ...mandatoryBenefitsTable,
            ...optionalBenefitsTable
          ]
        },
        {
          children: [
            ...ageBandTables.flat(),
            tableTitle("Premium Summary", 26, '#AC0233'),
            new Table({
              rows: premiumTableRows2,
              layout: TableLayoutType.FIXED,
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
            }),
          ]
        },
        {
          children: [
            pageTitle("Terms and Conditions", 57, "00587C"),
            ...this.termsConditions
          ],
        },
        {
          children: [
            ...exclusion
          ],
        },
   
        {
          children:
            [
              pageTitle("Acceptance of Proposal & Acknowledgment of Responsibilities", 57, "#00587C"),
              textLine("I, the undersigned and duly authorized by my company hereby:", 18, 100, 100, AlignmentType.LEFT),
              ...this.acceptance,
              spaceParagraph,
              ...this.nameAndSign,
              textLine("Upon your confirmation, MEDGULF requires up to 5 working days from receipt of regulatory approvals along with all the below listed requirements:", 18, 100, 100, AlignmentType.LEFT)
            ],
        },
        {
          children:
            [
              pageTitle("Policy Issuance Requirements", 57, "00587C"),
              textLine("Upon your confirmation, MEDGULF requires up to 5 working days from receipt of regulatory approvals along with all the below listed requirements:", 18, 100, 100, AlignmentType.LEFT),
              ...policyInsuranceRequirements1,
              textLine("Should any assistance be needed, please do not hesitate to contact us via:", 18, 100, 100, AlignmentType.LEFT),
              ...policyInsuranceRequirements2
            ],
        },
        {
          children: [await createImageFromBase64(pdfImages.pdfFooterImg, 450, 220)],
          headers: {
            default: this.createHeader(),
          },

          footers: {
            default: this.customFooter("Dubai Wharf Mall 1st Floor, Ofce DWR 22&23 Al Jaddaf Waterfront P.O. Box 30476, Dubai, UAE", "", "", 22, "#00587C"),
          },
        },
      ],

      styles: {
        default: {
          document: {
            run: {
              font: "Calibri", // Apply Calibri font
            },
            paragraph: {
              spacing: {
                line: 276, // Line spacing
              },
            },
          },
        },
      }
    });

    // Save the Word document
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${CRN}.docx`);
    });
  }
}
