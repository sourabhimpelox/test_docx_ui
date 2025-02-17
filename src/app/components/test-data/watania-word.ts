import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { saveAs } from "file-saver";

import { AlignmentType, Document, ImageRun, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, Header, Footer, SimpleField, BorderStyle, VerticalAlign, SectionType, PageBreak, TableLayoutType, Alignment, PageOrientation, LevelFormat, PageSize, HeadingLevel } from 'docx';

import {quoteData, CRN, basicTableData, termsAndConditions, acceptanceAndAcknowledgment, NameAndSignature, policyInsuranceRequirement1, policyInsuranceRequirement2, NUMBERING_CONFIG } from './medgulfdata';
// import { quoteData } from "./watania-data"
import { pdfImages } from './images';
import { pdfImages as pdfImages1 } from "./nlgi-pdf-images"

import { PremiumDetail, Category, CensusCategory, Exclusion, EmirateData, PdfAgeBandDetail, agebandData, CellOptions, TextLineOptions, BenefitData, CategoryData, ListItem } from './interfaces'
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-test-data',
  templateUrl: './test-data.component.html',
  styleUrls: ['./test-data.component.css']
})


export class TestDataComponent implements OnInit {

  constructor(private http: HttpClient) {
    this.transformedResultResponse = quoteData
  }

  public transformedResultResponse: any
  public totalColumns: any
  public columnWidth: any
  totalCategoryCount: number = 0
  public quoteGeneratedDate: any
  public currency: any
  todaydate: any
  async ngOnInit(): Promise<void> {
    let currentDate = new Date();
    this.todaydate = currentDate
    this.quoteGeneratedDate = this.transformedResultResponse?.companyDetails?.quoteGeneratedDate
    this.totalColumns = this.transformedResultResponse.quotes[0].data.length + 1
    this.columnWidth = 100 / this.totalColumns
    this.currency = this.transformedResultResponse.quotes[0]?.currency

  }

  BenefitsTable(category: any) {
    // Create a page break as a separate paragraph
    const pageBreak = new Paragraph({
      children: [],
      pageBreakBefore: true,
    });

    const title = this.pageTitle(`${category.category_name}`, 26, '#AC0233');

    const tableRows = [];

    // Category Header
    tableRows.push(
      new TableRow({
        children: [
          this.CommonCell(category.category_name, {
            fontSize: 12,
            bold: true,
            color: "#AC0233",
            width: { size: 100, type: "pct" },
            colSpan: 2,
          }),
        ],
      })
    );

    // Add Mandatory Benefits
    const mandatoryHeaders = this.formMandatoryBenefits([category]);
    this.addBenefitRowsForSingleCategory(mandatoryHeaders, category, tableRows);

    // Add Optional Benefits
    const optionalHeaders = this.formOptionalBenefits([category]);
    if (optionalHeaders.length > 0) {
      this.addBenefitRowsForSingleCategory(optionalHeaders, category, tableRows);
    }

    // Create Benefits Table
    const benefitsTable = new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
    });

    return [pageBreak, title, benefitsTable]; // Page break is separate from the table
  }


  async generateDynamicBenefitsTable(quote) {
    if (!Array.isArray(quote) || quote.length === 0) {
      console.error("❌ Invalid quote data:", quote);
      return [];
    }

    const categorySections = [];

    for (const category of quote) {
      try {
        let data = {
          category_name: category.category_name,
          pdfAgeBandDetails: category.data?.pdfAgeBandDetails || [],
          pdfAgeBandDetailsUnify: category.data?.pdfAgeBandDetailsUnify || [],
          census: category.census,
          emirate: category.data?.emirates?.emirates_name || "Unknown",
          tpa: category.data?.tpa?.tpa_name || "Unknown",
          ageValues: category.data?.age_values || [],
          premium: `${category.currency} ${category.data?.totalPremium || 0}`,
          totalMemberCount: category.data?.totalMemberCount || 0
        };

        // Create Benefits Table
        let benefitsTable = this.BenefitsTable(category);

        // Check if MAF data is available for the category
        let mafTable
        if (category.census && category.census.length > 0) {
          mafTable = this.mafRiskTable(category);
        }
        // Always Render AgeBandTable4
        let ageBandTable = this.AgeBandTable4(data, data.premium, data.totalMemberCount);

        categorySections.push({ benefitsTable,mafTable, ageBandTable });

      } catch (error) {
        console.error(`❌ Error processing category: ${category.category_name}`, error);
      }
    }

    return categorySections;
  }


  addBenefitRowsForSingleCategory(headers, category, tableRows) {
    const groupedHeaders = _.groupBy(headers, "group");

    Object.entries(groupedHeaders).forEach(([groupName, groupHeaders]) => {
      // Add group name as a header row
      tableRows.push(
        new TableRow({
          children: [
            this.CommonCell(groupName, {
              fontSize: 10,
              bold: true,
              color: "#AC0233",
              width: { size: 100, type: "pct" },
              colSpan: 2, // Spanning across both columns
            }),
          ],
        })
      );

      // Add benefits for this category
      groupHeaders.forEach((header) => {
        const value = this.getBenefitValueByCategory(header, category);
        tableRows.push(
          new TableRow({
            children: [
              this.CommonCell(header.header, {
                fontSize: 10,
                bold: false,
                width: { size: 50, type: "pct" },
              }),
              this.CommonCell(value || "N/A", {
                fontSize: 9,
                bold: false,
                width: { size: 50, type: "pct" },
              }),
            ],
          })
        );
      });
    });
  }


  formMandatoryBenefits(quote) {
    const headers = [];

    if (!quote || !Array.isArray(quote)) {
      console.error("Quote is not valid:", quote);
      return headers; // Return an empty array if quote is invalid
    }

    quote.forEach((category) => {
      if (category.data && Array.isArray(category.data.mandatory_benefits)) {
        category.data.mandatory_benefits.forEach((benefit, index) => {
          if (benefit && benefit.tob_header) {
            headers.push({
              index,
              group: benefit.group_details || "No Group",
              header: benefit.tob_header.trim(),
            });
          }
        });
      }
    });

    const sortedHeaders = _.sortBy(headers, "index");
    return _.uniqBy(sortedHeaders, "header");
  }

  formOptionalBenefits(quote) {
    const headers = [];

    quote.forEach((category) => {
      if (category.data && Array.isArray(category.data.optional_benefits)) {
        category.data.optional_benefits.forEach((benefit, index) => {
          if (benefit && benefit.tob_header) {
            headers.push({
              index,
              group: benefit.group_details || "No Group",
              header: benefit.tob_header.trim(),
            });
          }
        });
      }
    });

    const sortedHeaders = _.sortBy(headers, "index");
    return _.uniqBy(sortedHeaders, "header");
  }


  getBenefitValueByCategory(header, category) {
    if (!category.data) return null;

    // Search for a matching benefit in both mandatory and optional benefits
    const benefit = category.data.mandatory_benefits?.find(
      (benefit) => benefit.tob_header.trim() === header.header.trim()
    ) || category.data.optional_benefits?.find(
      (benefit) => benefit.tob_header.trim() === header.header.trim()
    );

    // Log if we found the benefit and its value
    if (benefit) {
      return benefit.tob_value || "N/A";
    }

    return "N/A"; // Return N/A if no matching benefit is found
  }


  createList(list: any): Paragraph[] {
    return list.map((item: ListItem) => {
      // Handle both normal items and nested lists
      if (item.nestedList && Array.isArray(item.nestedList) && item.nestedList.length > 0) {
        const nestedParagraphs = item.nestedList.map((nestedItem) =>
          new Paragraph({
            text: nestedItem.text,
            numbering: {
              reference: 'dynamic-bullets',  // Bullet for nested items
              level: nestedItem.level,
            },
            alignment: AlignmentType.LEFT,
          })
        );
        return [
          new Paragraph({
            text: item.text,
            numbering: {
              reference: 'dynamic-bullets',  // Bullet for parent item
              level: item.level,
            },
            alignment: AlignmentType.LEFT,
          }),
          ...nestedParagraphs,  // Add nested items if they exist
        ];
      } else {
        // Handle regular list item
        return new Paragraph({
          text: item.text,
          numbering: item.type === 'number'
            ? { reference: 'dynamic-numbering', level: item.level }
            : item.type === 'bullet'
              ? { reference: 'dynamic-bullets', level: item.level }
              : undefined,  // No numbering or bullets
          alignment: AlignmentType.LEFT,
        });
      }
    }).flat();  // Flatten the nested array
  }
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

  //****************************************************************** */
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
        premium: `${category.currency} ${category.data.totalPremium}`,
        totalMemberCount: category.data.totalMemberCount
      }
    });
  }
  //****************************************************************** */
  //  to add commas in number 
  formatNumber(value: any) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  formatDate(date: any) {
    return moment(date).format("DD MMM YYYY")
  }
  //****************************************************************** */
  // Mostly used functionalities 
  // for images
  async createImageFromBase64(base64Image: string, width: number, height: number): Promise<Paragraph> {
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

  // title of each table 
  tableTitle(titleText: string, size: number = 26, color: string = '#AC0233') {
    return new Paragraph({
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
    })
  }
  // borders for all tables 
  defaultBorders(size: number = 10, border: any = "single") {
    return {
      top: { size: size, color: "000000", space: 0, style: border },
      bottom: { size: size, color: "000000", space: 0, style: border },
      left: { size: size, color: "000000", space: 0, style: border },
      right: { size: size, color: "000000", space: 0, style: border },
    };
  };

  // to add any line 
  textLine(
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

  // it gives space between two items 
  spaceParagraph = new Paragraph({
    children: [
      new TextRun({
        text: " ", // Empty text to create space
        size: 1, // Small size to avoid visible text but still creating space
      }),
    ],
    spacing: { after: 200 }, // Adjust space between tables
  });

  // common cell for every table 

  CommonCell(text: any, options: CellOptions = {}) {
    const {
      bold = false,
      fontSize = 9,
      fillColor = "#FFFFFF",
      color = "#000000",
      alignment = AlignmentType.LEFT,
      rowSpan,
      colSpan,
      width
    } = options;

    // Split the text into segments while keeping the original line breaks
    const segments = String(text).split(/(\r\n\r\n|\r\n)/);
    const runs: TextRun[] = [];

    segments.forEach((segment, index) => {
      // If it's a line break, determine the type and add a small or larger break
      if (segment === "\r\n") {
        runs.push(new TextRun({ break: 1, size: fontSize * 1.5 })); // Small break
      } else if (segment === "\r\n\r\n") {
        runs.push(new TextRun({ break: 2, size: fontSize * 2.5 })); // Larger break
      } else if (segment.trim()) {
        // Add the actual text
        runs.push(
          new TextRun({
            text: segment.trim(),
            bold,
            size: fontSize * 2,
            color,
            font: "Calibri",
          })
        );
      }
    });

    return new TableCell({
      children: [
        new Paragraph({
          children: runs,
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
      borders: this.defaultBorders(10, "single"), // Default borders
      margins: { left: 20, top: 10, right: 20 },
    });
  }

  // For Page Title
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

  // header content using canvas
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
  //****************************************************************** */

  // Common Footer
  async commonFooter(imagePath: string): Promise<Footer> {
    // Fetch the image using createImage function
    const footerImage = await this.createImageFromBase64(imagePath, 220, 120);

    return new Footer({
      children: [
        new Table({
          rows: [
            new TableRow({
              children: [
                // Empty cell for spacing or alignment
                new TableCell({
                  children: [
                    this.textLine('', 10, 0, 0, AlignmentType.CENTER),
                  ],
                  width: { size: 33, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.BOTTOM,
                  margins: { top: 0, bottom: 0, left: 0, right: 0 },
                  borders: this.defaultBorders(0, 'none')
                }),
                // Centered text cell
                new TableCell({
                  children: [
                    this.textLine('*This is a system-generated quote that does not require a signature', 10, 0, 0, AlignmentType.CENTER, '#ababab'),
                    this.textLine('The Mediterranean & Gulf Insurance & Reinsurance Co. B.S.C', 10, 0, 0, AlignmentType.CENTER, '#ababab'),
                    this.textLine('C.R. No: 1204528 - Insurance Authority No. 91', 10, 0, 0, AlignmentType.CENTER, '#ababab'),
                  ],
                  verticalAlign: VerticalAlign.BOTTOM,
                  width: { size: 34, type: WidthType.PERCENTAGE },
                  margins: { top: 0, bottom: 0, left: 0, right: 20 },
                  borders: this.defaultBorders(0, 'none')
                }),
                // Image cell
                new TableCell({
                  children: [footerImage], // Add the image
                  width: { size: 33, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.BOTTOM,
                  margins: { top: 0, bottom: 0, left: 20, right: 0 },
                  borders: this.defaultBorders(0, 'none')
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
  // category member table 
  createRow2 = (categoryName: string, members: number, option: string) =>
    new TableRow({
      children: [
        this.CommonCell(categoryName, { fontSize: 9, bold: false, width: { size: 33, type: "pct" } }),
        this.CommonCell(String(members), { fontSize: 9, bold: false, width: { size: 33, type: "pct" } }),
        this.CommonCell(option, { fontSize: 9, bold: false, width: { size: 34, type: "pct" } }),
      ],
    });


  categoriesDetailTable(categoryData: { categoryName: string; members: number; option: string }[], quoteData: any) {
    const categoryMemberTableRows = [
      ...categoryData
        .sort((a, b) => {
          // Compare category names in alphabetical order
          if (a.categoryName < b.categoryName) return -1;
          if (a.categoryName > b.categoryName) return 1;
          return 0;
        })
        .map(({ categoryName, members, option }) =>
          this.createRow2(categoryName, members, option)
        ),
      // Add the "Total" row
      new TableRow({
        children: [
          this.CommonCell('Total', { fontSize: 9, bold: true, width: { size: 33, type: 'pct' } }),
          this.CommonCell(String(this.totalCategoryCount), { fontSize: 9, bold: true, width: { size: 33, type: 'pct' } }),
          this.CommonCell(
            `${quoteData.quotes[0].currency} ${quoteData.quotes[0].option_premium}`,
            { fontSize: 9, bold: true, width: { size: 34, type: 'pct' } }
          ),
        ],
      }),
    ];

    return new Table({
      rows: [
        // Header row
        new TableRow({
          children: [
            this.CommonCell('Categories', { color: '#AC0233', fillColor: '#d5d5d5', fontSize: 9, bold: true, width: { size: 33, type: 'pct' } }),
            this.CommonCell('Members', { color: '#AC0233', fillColor: '#d5d5d5', fontSize: 9, bold: true, width: { size: 33, type: 'pct' } }),
            this.CommonCell('Option 1', { color: '#AC0233', fillColor: '#d5d5d5', fontSize: 9, bold: true, width: { size: 34, type: 'pct' } }),
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
  }
  //****************************************************************** */
  // quote summary row 
  createSummaryTable(quote: any): Table {
    return new Table({
      rows: [
        new TableRow({
          children: [
            this.CommonCell("Quote 1", { fontSize: 11, color: "#AC0233", bold: true, width: { size: 33, type: "pct" } }), // First column
            this.CommonCell(
              `${(quote.quote_type[0].toUpperCase()) + ((quote.quote_type).slice(1))} Quote${quote.risk_type.toLowerCase() === "no" ? "" : ` & ${(quote.risk_type).toUpperCase()}`}`,
              {
                fontSize: 11,
                bold: true,
                color: "#AC0233",
                width: { size: 34, type: "pct" }
              }
            ),
            this.CommonCell(`${quote.currency} ${this.formatNumber(quote.option_premium)}`, { fontSize: 11, bold: true, color: "#AC0233", width: { size: 33, type: "pct" } }), // Third column
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
  AgeBandTable1(category: any) {

    const pageBreak = new Paragraph({
      children: [],
      pageBreakBefore: true,
    });

    const title = this.pageTitle(`Age Band - ${category.emirate} - ${category.category_name}`, 26, '#AC0233');

    // Create reusable tables
    const memberCountTable = this.createCategoryTable(
      category.category_name,
      "Member Count",
      "memberCount",
      category.pdfAgeBandDetails
    );

    const grossPremiumTable = this.createCategoryTable(
      category.category_name,
      "Gross Premium",
      "grossPremium",
      category.pdfAgeBandDetails
    );

    const totalGrossPremiumTable = this.createCategoryTable(
      category.category_name,
      "Total Gross Premium",
      "totalGrossPremium",
      category.pdfAgeBandDetails
    );

    return [pageBreak, title, memberCountTable, grossPremiumTable, totalGrossPremiumTable];
  }

  createCategoryTable(categoryName: string, titleText: string, tableType: "memberCount" | "grossPremium" | "totalGrossPremium", details: any[]): Table {
    // Title for the section
    const title = this.tableTitle(`${titleText} - ${categoryName}`, 26, "#AC0233");

    // Header Rows for the table
    const headers: TableRow[] = [
      new TableRow({
        children: [
          this.CommonCell("Age band", {
            fillColor: "#B7B5CF",
            color: "#365d7c",
            bold: true,
            fontSize: 8,
            rowSpan: 3,
            alignment: AlignmentType.CENTER
          }),
          this.CommonCell(
            tableType === "memberCount" ? "Member Count" :
              tableType === "grossPremium" ? "Gross Premium" : "Total Gross Premium",
            { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, colSpan: 5, alignment: AlignmentType.CENTER }
          ),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Employees", {
            fillColor: "#E7E5EF",
            bold: true,
            fontSize: 8,
            colSpan: 2,
            alignment: AlignmentType.CENTER
          }),
          this.CommonCell("Dependents", {
            fillColor: "#E7E5EF",
            bold: true,
            fontSize: 8,
            colSpan: 2,
            alignment: AlignmentType.CENTER
          }),
          this.CommonCell("Maternity", {
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
          this.CommonCell("Male", { fillColor: "#E7E5EF", fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell("Female", { fillColor: "#E7E5EF", fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell("Male", { fillColor: "#E7E5EF", fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell("Female", { fillColor: "#E7E5EF", fontSize: 8, alignment: AlignmentType.CENTER }),
        ],
      }),
    ];

    // Add data rows based on the details provided
    const dataRows: TableRow[] = details.map((row: any) => {
      const type = tableType === "memberCount" ? "Count" :
        tableType === "grossPremium" ? "GrossPremium" : "TotalGrossPremium";

      return new TableRow({
        children: [
          this.CommonCell(row.age, { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(type === "Count" ? row.Employee[`male${type}`] : row.Employee[`male${type}`].toFixed(2), { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(type === "Count" ? row.Employee[`female${type}`] : row.Employee[`female${type}`].toFixed(2), { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(type === "Count" ? row.Dependents[`male${type}`] : row.Dependents[`male${type}`].toFixed(2), { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(type === "Count" ? row.Dependents[`female${type}`] : row.Dependents[`female${type}`].toFixed(2), { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(type === "Count" ? row[`maternity${type}`] : row[`maternity${type}`].toFixed(2), { fontSize: 8, alignment: AlignmentType.CENTER }),
        ],
      });
    });

    // Add an empty row at the end
    if (tableType === "memberCount" || tableType === "grossPremium") {
      dataRows.push(
        new TableRow({
          children: [this.CommonCell("", { colSpan: 6, fontSize: 8, alignment: AlignmentType.CENTER })],
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
  AgeBandTable2(category: any) {
    let details = category.pdfAgeBandDetailsUnify;
    const pageBreak = new Paragraph({
      children: [],
      pageBreakBefore: true,
    });

    const title = this.pageTitle(`Age Band - ${category.emirate} - ${category.category_name}`, 26, '#AC0233');

    const headers = [
      new TableRow({
        children: [
          this.CommonCell("Age brackets", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, rowSpan: 3, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Dubai", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, colSpan: 5, width: { size: 16.67 * 5, type: "pct" }, alignment: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Member Count", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 2, width: { size: 16.67 * 2, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Gross Premium per member", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 2, width: { size: 16.67 * 2, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Total Gross Premium", { fillColor: "#E7E5EF", bold: true, fontSize: 8, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Employees & Dependents", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Maternity Eligible", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Employees & Dependents excl. Maternity", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Maternity Premium Per Eligible Female", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Total", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
        ],
      }),
    ];

    // Add data rows based on the details provided
    const dataRows: TableRow[] = details.map((row: any) => {
      return new TableRow({

        children: [
          this.CommonCell(row.age, { fontSize: 8, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell(row.members_count, { fontSize: 8, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell(row.maternity_count, { fontSize: 8, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell(row.members_gross_premium, { fontSize: 8, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell(row.maternity_gross_premium, { fontSize: 8, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell(row.total_gross_premium, { fontSize: 8, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
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
        this.CommonCell("Total", { fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
        this.CommonCell(String(totalMembersCount), { fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
        this.CommonCell(String(totalMaternityCount), { fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
        this.CommonCell(totalMembersGrossPremium, { fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
        this.CommonCell(maternityGrossPremiumPerMember, { fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
        this.CommonCell(totalGrossPremium.toFixed(2), { fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
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
  AgeBandTable3(category: any) {
    let details = category.pdfAgeBandDetailsUnify;
    const pageBreak = new Paragraph({
      children: [],
      pageBreakBefore: true,
    });

    const title = this.pageTitle(`Age Band - ${category.emirate} - ${category.category_name}`, 26, '#AC0233');

    const headers = [
      new TableRow({
        children: [
          this.CommonCell("Age brackets", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, rowSpan: 3, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Abu Dhabi", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, colSpan: 10, width: { size: 9.09 * 10, type: "pct" }, alignment: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Member Count", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 3, width: { size: 9.09 * 3, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Gross Premium per member", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 3, width: { size: 9.09 * 3, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Total Gross Premium", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 4, width: { size: 9.09 * 3, type: "pct" }, alignment: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Employees", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Dependents", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Maternity", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Employees", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Dependents", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Maternity", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Employees", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Dependents", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Maternity", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Total", { fillColor: "#E7E5EF", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
        ],
      }),
    ];

    // Add data rows based on the details provided
    // Add data rows based on the details provided
    const dataRows: TableRow[] = details.map((row: any) => {
      return new TableRow({

        children: [
          this.CommonCell(row.age || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell(row.employee_count || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell(row.dependent_count || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell(row.maternity_count || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell(row.employee_gross_premium || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell(row.dependent_gross_premium || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell(row.maternity_gross_premium || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell((row.employee_gross_premium * row.employee_count).toFixed(2) || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell((row.dependent_gross_premium * row.dependent_count).toFixed(2) || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell((row.maternity_gross_premium * row.maternity_count).toFixed(2) || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell(((row.employee_gross_premium * row.employee_count) + (row.dependent_gross_premium * row.dependent_count) + (row.maternity_gross_premium * row.maternity_count)).toFixed(2) || '0', { fontSize: 8, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
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
        this.CommonCell("Total", { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
        this.CommonCell(String(totalEmployeesCount) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
        this.CommonCell(String(totalDependentsCount) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
        this.CommonCell(String(totalMaternityCount) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
        this.CommonCell(employeeGrossPremiumPerMember.toFixed(2) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
        this.CommonCell(dependentGrossPremiumPerMember.toFixed(2) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
        this.CommonCell(maternityGrossPremiumPerMember.toFixed(2) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
        this.CommonCell(employeeTotalGrossPremium.toFixed(2) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
        this.CommonCell(dependentTotalGrossPremium.toFixed(2) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
        this.CommonCell(maternityTotalGrossPremium.toFixed(2) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
        this.CommonCell(totalGrossPremium.toFixed(2) || '0', { fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
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
  AgeBandTable4(category: any, premium: any, member: any) {
    let details = category.ageValues
    const pageBreak = new Paragraph({
      children: [],
      pageBreakBefore: true,
    });

    const title = this.pageTitle(`Age Band - ${category.emirate} - ${category.category_name}`, 26, '#AC0233');

    const headers = [
      new TableRow({
        children: [
          this.CommonCell("Age Band", { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, rowSpan: 3 }),
          this.CommonCell("Employees", { bold: true, colSpan: 3, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Dependents", { bold: true, colSpan: 3, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Total", { bold: true, colSpan: 6, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell(`Premium ${this.transformedResultResponse.quotes[0]?.currency}`, { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 3 }),
          this.CommonCell(`Premium ${this.transformedResultResponse.quotes[0]?.currency}`, { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 3 }),
          this.CommonCell("Member Count", { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 3 }),
          this.CommonCell(`Premium ${this.transformedResultResponse.quotes[0]?.currency}`, { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 3 }),

        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Single Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Married Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Single Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Married Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Single Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Married Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Single Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Married Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
        ],
      }),
    ];



    // Add data rows based on the details provided
    // Add data rows based on the details provided
    const dataRows: TableRow[] = details.map((row: any) => {
      let maleEmployeePremium = row?.member?.Employee?.malePremiumDisplay ? this.formatNumber(row?.member?.Employee?.malePremiumDisplay) : "";

      let singleFemaleEmployeePremium = row?.member?.Employee?.singleFemalePremiumDisplay ? this.formatNumber(row?.member?.Employee?.singleFemalePremiumDisplay) : "";

      let marriedFemaleEmployeePremium = row?.member?.Employee?.marriedFemalePremiumDisplay ? this.formatNumber(row?.member?.Employee?.marriedFemalePremiumDisplay) : "";

      let maleDependentsPremium = row?.member?.Dependents?.malePremiumDisplay ? this.formatNumber(row?.member?.Dependents?.malePremiumDisplay) : "";

      let singleFemaleDependentsPremium = row?.member?.Dependents?.singleFemalePremiumDisplay ? this.formatNumber(row?.member?.Dependents?.singleFemalePremiumDisplay) : "";

      let marriedFemaleDependentsPremium = row?.member?.Dependents?.marriedFemalePremiumDisplay ? this.formatNumber(row?.member?.Dependents?.marriedFemalePremiumDisplay) : "";

      let totalMale = row?.member?.totalMale ? this.formatNumber(row?.member?.totalMale) : "";

      let totalSingleFemale = row?.member?.totalSingleFemale ? this.formatNumber(row?.member?.totalSingleFemale) : "";

      let totalMarriedFemale = row?.member?.totalMarriedFemale ? this.formatNumber(row?.member?.totalMarriedFemale) : "";
      return new TableRow({
        children: [
          this.CommonCell(row.age || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(maleEmployeePremium || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(singleFemaleEmployeePremium || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(marriedFemaleEmployeePremium || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(maleDependentsPremium || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(singleFemaleDependentsPremium || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(marriedFemaleDependentsPremium || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(row?.member?.maleMemberCount || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(row?.member?.singleFemaleMemberCount || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(row?.member?.marriedFemaleMembeCount || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(totalMale || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(totalSingleFemale || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(totalMarriedFemale || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
        ],
      });
    });

    const totalRow = new TableRow({
      children: [
        this.CommonCell("Total", { bold: true, alignment: AlignmentType.CENTER, colSpan: 7 }),
        this.CommonCell(`Members ${member}`, { bold: true, alignment: AlignmentType.CENTER, colSpan: 3 }),
        this.CommonCell(`Premium : ${premium}`, { bold: true, alignment: AlignmentType.CENTER, colSpan: 3 }),

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

  // age band table type 5
  AgeBandTable5(category: any, premium: any, member: any) {
    let details = category.ageValues
    const pageBreak = new Paragraph({
      children: [],
      pageBreakBefore: true,
    });

    const title = this.pageTitle(`Age Band - ${category.emirate} - ${category.category_name}`, 26, '#AC0233');

    const headers = [
      new TableRow({
        children: [
          this.CommonCell("Age Band", { bold: true, fontSize: 8, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, rowSpan: 3 }),
          this.CommonCell("Employees", { bold: true, fontSize: 8, colSpan: 4, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Dependents", { bold: true, fontSize: 8, colSpan: 4, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Total", { bold: true, fontSize: 8, colSpan: 4, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Member Count", { bold: true, fontSize: 8, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 2 }),
          this.CommonCell(`Premium ${this.transformedResultResponse.quotes[0]?.currency}`, { bold: true, fontSize: 8, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 2 }),
          this.CommonCell("Member Count", { bold: true, fontSize: 8, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 2 }),
          this.CommonCell(`Premium ${this.transformedResultResponse.quotes[0]?.currency}`, { bold: true, fontSize: 8, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 2 }),
          this.CommonCell("Member Count", { bold: true, fontSize: 8, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 2 }),
          this.CommonCell(`Premium ${this.transformedResultResponse.quotes[0]?.currency}`, { bold: true, fontSize: 8, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 2 }),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Male", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
          this.CommonCell("Female", { bold: true, fontSize: 8, fillColor: "#E7E5EF", alignment: AlignmentType.CENTER }),
        ],
      }),
    ];

    const dataRows: TableRow[] = details.map((row: any) => {

      let maleEmployeePremium = row?.member?.Employee?.malePremiumDisplay ? this.formatNumber(row?.member?.Employee?.malePremiumDisplay) : "";

      let femaleEmployeePremium = row?.member?.Employee?.femalePremiumDisplay ? this.formatNumber(row?.member?.Employee?.femalePremiumDisplay) : "";

      let maleDependentsPremium = row?.member?.Dependents?.malePremiumDisplay ? this.formatNumber(row?.member?.Dependents?.malePremiumDisplay) : "";

      let femaleDependentsPremium = row?.member?.Dependents?.femalePremiumDisplay ? this.formatNumber(row?.member?.Dependents?.femalePremiumDisplay) : "";

      let totalMale = row?.member?.totalMale ? this.formatNumber(row?.member?.totalMale) : "";

      let totalFemale = row?.member?.totalFemale ? this.formatNumber(row?.member?.totalFemale) : "";


      return new TableRow({
        children: [
          this.CommonCell(row.age || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(row?.member?.Employee?.maleCount || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(row?.member?.Employee?.femaleCount || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(maleEmployeePremium || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(femaleEmployeePremium || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(row?.member?.Dependents?.maleCount || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(row?.member?.Dependents?.femaleCount || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(maleDependentsPremium || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(femaleDependentsPremium || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(row?.member?.maleMemberCount || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(row?.member?.femaleMemberCount || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(totalMale || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell(totalFemale || '0', { fontSize: 8, alignment: AlignmentType.CENTER }),
        ],
      });
    });


    const totalRow = new TableRow({
      children: [
        this.CommonCell("Total", { bold: true, alignment: AlignmentType.CENTER, colSpan: 9 }),
        this.CommonCell(`Members ${member}`, { bold: true, alignment: AlignmentType.CENTER, colSpan: 2 }),
        this.CommonCell(`Premium : ${premium}`, { bold: true, alignment: AlignmentType.CENTER, colSpan: 2 }),

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
  //****************************************************************** */
  // maf risk table 
  mafRiskTable(category: any): any[] {

    const rows: TableRow[] = [];

    const pageBreak = new Paragraph({
      children: [],
      pageBreakBefore: true,
    });

    // Add Table Header
    rows.push(
      new TableRow({
        children: [

          this.CommonCell("S.No", { fontSize: 10, bold: true, width: { size: 8, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
          this.CommonCell("Employee Id", { fontSize: 10, bold: true, width: { size: 14, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
          this.CommonCell("Employee Name", { fontSize: 10, bold: true, width: { size: 28, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
          this.CommonCell("Relations", { fontSize: 10, bold: true, width: { size: 14, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
          this.CommonCell("Age", { fontSize: 10, bold: true, width: { size: 8, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
          this.CommonCell("Category", { fontSize: 10, bold: true, width: { size: 14, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
          this.CommonCell("Member Type", { fontSize: 10, bold: true, width: { size: 14, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
        ],
      })
    );

    // Add Census Data Rows
    category.census.forEach((census: any, index: number) => {
      rows.push(
        new TableRow({
          children: [
            this.CommonCell((index + 1).toString(), { fontSize: 10, bold: false, width: { size: 8, type: "pct" }, alignment: AlignmentType.CENTER }),
            this.CommonCell(String(census.employee_id), { fontSize: 10, bold: false, width: { size: 14, type: "pct" }, alignment: AlignmentType.CENTER }),
            this.CommonCell(census.employee_name, { fontSize: 10, bold: false, width: { size: 28, type: "pct" }, alignment: AlignmentType.CENTER }),
            this.CommonCell(census.relations, { fontSize: 10, bold: false, width: { size: 14, type: "pct" }, alignment: AlignmentType.CENTER }),
            this.CommonCell(census.age.toString(), { fontSize: 10, bold: false, width: { size: 8, type: "pct" }, alignment: AlignmentType.CENTER }),
            this.CommonCell(census.category, { fontSize: 10, bold: false, width: { size: 14, type: "pct" }, alignment: AlignmentType.CENTER }),
            this.CommonCell(census.member_type, { fontSize: 10, bold: false, width: { size: 14, type: "pct" }, alignment: AlignmentType.CENTER }),
          ],
        })
      );
    });

    let title = this.pageTitle(`MAF Required Members - ${category.category_name}`, 24, '#AC0233')

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

  // check for age band tables 
  checkSingleFemalePremiumDisplay(arr: any) {
    if (arr.length === 0) return false; // Return false if the array is empty

    const firstObject = arr[0];
    const { Dependents, Employee } = firstObject.member || {};

    // Check Dependents or Employee for singleFemalePremiumDisplay
    return (
      (Dependents?.singleFemalePremiumDisplay !== undefined) ||
      (Employee?.singleFemalePremiumDisplay !== undefined)
    );
  }



  //****************************************************************** */

  // category and Premium table 
  createRow3 = (tobHeader: string, values: string[]): TableRow =>
    new TableRow({
      children: [
        this.CommonCell(tobHeader, { fontSize: 10, bold: false, width: { size: this.columnWidth, type: "pct" } }), // First column for "Tob Header"
        ...values.map(value => this.CommonCell(value, { fontSize: 9, bold: false, width: { size: this.columnWidth, type: "pct" } })), // Other columns for categories
      ],
    });

  createPremiumTableRows = (data: Category[], fontColor: any, bgColor: any): TableRow[] => {
    // Extract the tob_headers (unique keys in each category)
    const tobHeaders = data[0].premium_details.map((item: PremiumDetail) => item.tob_header);

    // First row is the header row (Tob Header and categories)
    const headerRow = new TableRow({
      children: [
        this.CommonCell('Premium', { fontSize: 10, bold: true, color: fontColor, fillColor: bgColor, width: { size: this.columnWidth, type: "pct" } }), // First column for "Tob Header"
        ...data.map(category => this.CommonCell(category.category_name, { fontSize: 10, color: fontColor, fillColor: bgColor, bold: true, width: { size: this.columnWidth, type: "pct" } })), // Columns for categories
      ],
    });

    // Data rows: For each tob_header, create a row with values for each category
    const uniqueTobHeaders = new Map<string, string | number>(); // To store the latest values for each header

    // Iterate through all categories and their premium_details to capture the latest value for each tobHeader
    data.forEach(category => {
      category.premium_details.forEach((detail: PremiumDetail) => {
        uniqueTobHeaders.set(detail.tob_header, detail.tob_value);
      });
    });

    const dataRows = Array.from(uniqueTobHeaders.keys()).map((tobHeader: string) => {
      const values = data.map(category => {
        const premiumDetail = category.premium_details.find(
          (detail: PremiumDetail) => detail.tob_header === tobHeader
        );

        const tobValue = premiumDetail ? premiumDetail.tob_value : ''; // Get tob_value or empty string

        // Skip formatNumber if the tobHeader is "Member count"
        return tobHeader === "Member count"
          ? tobValue // Return raw value for "Member count"
          : typeof tobValue === 'number'
            ? this.formatNumber(tobValue) // Format number for other headers
            : tobValue; // Return as-is for non-numeric values
      });

      return this.createRow3(tobHeader, values);
    });


    return [headerRow, ...dataRows];
  };





  async generateDocument(quoteData: any) {


    // category member table 
    let categoryData = this.categoriesWithDetails(quoteData.allCensusData, quoteData.quotes[0].data, 'category');
    let categoriesDetailsTable = this.categoriesDetailTable(categoryData, quoteData)

    // quote summary row 
    const summaryTable = this.createSummaryTable(quoteData.quotes[0]);

    // Category and Benifits table
    let categoryBenefitsTable = await this.generateDynamicBenefitsTable(quoteData.quotes[0].data)


    // Age band and Maf Tables 
    const ageBandAndMafInfo = this.ageBandAndMafData(quoteData.quotes[0].data);
    // Age band Tables 
    const ageBandTables = ageBandAndMafInfo.map((category, index) => {
      let ageBandTable
      const content = [];

      // Check if MAF data is available for the category
      if (category.census && category.census.length > 0) {
        const mafTable = this.mafRiskTable(category);
        content.push(...mafTable);
      }

      let isSingleFemalePremiumDisplayExist = this.checkSingleFemalePremiumDisplay(category.ageValues)
      let isMaternityFemalePremiumDisplayExist = this.checkSingleFemalePremiumDisplay(category.ageValues)

      if (isSingleFemalePremiumDisplayExist) {
        ageBandTable = this.AgeBandTable4(category, category.premium, category.totalMemberCount)
      } else {
        ageBandTable = this.AgeBandTable5(category, category.premium, category.totalMemberCount)
      }

      if (isMaternityFemalePremiumDisplayExist) {
        if (category.emirate.trim().toLowerCase() === "dubai" && category.tpa.trim().toLowerCase() === "nextcare") {
          ageBandTable = this.AgeBandTable2(category)
        } else if (category.emirate.trim().toLowerCase() === "abu dhabi" && category.tpa.trim().toLowerCase() === "nextcare") {
          ageBandTable = this.AgeBandTable3(category)
        } else {
          ageBandTable = this.AgeBandTable1(category);
        }
      }
      content.push(...ageBandTable);
      return content;
    });





    // Create the Word document
    const doc = new Document({
      numbering: {
        config: [
          { reference: 'dynamic-numbering', levels: NUMBERING_CONFIG.dynamicNumbering },
          { reference: 'dynamic-bullets', levels: NUMBERING_CONFIG.dynamicBullets },
        ],
      },
      sections: [

        // {
        //   children: [
        //     summaryTable,
        //     this.tableTitle("Categories & Benefits", 26, '#AC0233'),
        //     ...categoryBenefitsTable

        //   ]
        // },
        {
          children: [
            ...categoryBenefitsTable.flatMap(({ benefitsTable, ageBandTable }) => [
              benefitsTable,
              ageBandTable
            ]).flat(),
            
          ]
        },
        {
          children: [
            ...ageBandTables.flat(),
          ]
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
      saveAs(blob, `${this.transformedResultResponse?.companyDetails?.client_reference_number}.docx`);
    });
  }

  async createDocument() {
    return await this.generateDocument(this.transformedResultResponse)
  }

}
