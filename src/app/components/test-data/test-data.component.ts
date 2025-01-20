import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { saveAs } from "file-saver";

import { AlignmentType, Document, ImageRun, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, Header, Footer, SimpleField, BorderStyle, VerticalAlign, SectionType, PageBreak, TableLayoutType, Alignment, PageOrientation } from 'docx';

import { CRN, quoteData, basicTableData, termsAndConditions, acceptanceAndAcknowledgment, NameAndSignature, policyInsuranceRequirement1, policyInsuranceRequirement2 } from './data';
import { pdfImages } from './images';
import { pdfImages as pdfImages1 } from "./nlgi-pdf-images"

import { PremiumDetail, Category, CensusCategory, Exclusion, EmirateData, PdfAgeBandDetail, agebandData, CellOptions } from './interfaces'


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
  todaydate: any
  async ngOnInit(): Promise<void> {
    let currentDate = new Date();
    this.todaydate = currentDate
    this.quoteGeneratedDate = this.transformedResultResponse?.companyDetails?.quoteGeneratedDate
    this.totalColumns =
      this.transformedResultResponse.quotes[0].data.length + 1
    this.columnWidth = 100 / this.totalColumns
  }
  // categoey details table data 

  convertNumber(value: any) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
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
  // premium table data 
  PremiumTableData = (quoteData: any[]) => {
    return quoteData.map((category: any) => ({
      category_name: category.category_name,
      premium_details: category.data?.premium_details || category.premium_details || [],
    }));
  };
  //****************************************************************** */
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

  // Mostly used functionalities 
  // for images
  async createImageFromBase64(base64Image: string, width: number, height: number, align: any = AlignmentType.LEFT): Promise<Paragraph> {
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
      alignment: align,
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
  tableTitle(titleText: string, size: number = 11, color: string = '#000000') {
    return new Paragraph({
      children: [
        new TextRun({
          text: titleText,
          size: size * 2,
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
    size: number = 10,
    bold: boolean = false,
    before: number = 100,
    after: number = 100,
    alignment: any = AlignmentType.LEFT,
    color?: string,
  ): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: text,
          size: 2 * size,
          bold,
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
  CommonCell(text: string, options: CellOptions = {}) {
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
      borders: this.defaultBorders(10, 'single'), // Default borders
      margins: { left: 20, top: 20 },
    });
  }

  // For Page Title
  pageTitle(title: string, size: number = 28, color: string = "#00587C", underline?: boolean, alignment: any = "left") {
    return new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: size * 2,
          color: color,
          font: "Calibri",
          underline: underline ? { type: "single" } : undefined,
        }),
      ],
      heading: "Heading1",
      spacing: {
        after: 200,
      },
      alignment
    });
  }

  horizontalLine(size: number) {
    return new Paragraph({
      children: [], // No content in this paragraph
      border: {
        bottom: {
          style: BorderStyle.THICK, // You can adjust the thickness
          size, // Line thickness
          color: '#000000', // Line color
        },
      },
      spacing: { after: 10 }, // Space after the horizontal line
    })
  }
  //****************************************************************** */

  commonHeader = async () => {
    // Fetch the left and right image data using createImageFromBase64
    const leftImage = await this.createImageFromBase64(pdfImages1.headerLogo, 80, 80, AlignmentType.LEFT); // Left image
    const rightImage = await this.createImageFromBase64(pdfImages1.headerIcon, 150, 100, AlignmentType.RIGHT); // Right image

    // Return a header with a single paragraph
    return new Header({
      children: [
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [leftImage], // Add the image
                  width: { size: 33, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.CENTER,
                  margins: { top: 0, bottom: 0, left: 0, right: 0 },
                  borders: this.defaultBorders(0, 'none')
                }),
                // Centered text cell
                new TableCell({
                  children: [this.textLine('', 0, false, 0, 0, AlignmentType.CENTER, '')],
                  verticalAlign: VerticalAlign.CENTER,
                  width: { size: 34, type: WidthType.PERCENTAGE },
                  margins: { top: 0, bottom: 0, left: 0, right: 20 },
                  borders: this.defaultBorders(0, 'none')
                }),
                // Image cell
                new TableCell({
                  children: [rightImage],
                  width: { size: 33, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.CENTER,
                  margins: { top: 0, bottom: 0, left: 0, right: 0 },
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
        this.spaceParagraph
      ],

    });
  };

  firstPageHeader = async () => {
    const image = await this.createImageFromBase64(pdfImages1.logo, 500, 110, AlignmentType.CENTER); // Left image

    return new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,  // Center the content
          children: [image], // Add the image
        }),
        new Paragraph({
          children: [],
          spacing: { after: 30 },
        }),
      ],
    });
  };
  //****************************************************************** */
  // Common Footer
  async commonFooter(): Promise<Footer> {
    // Fetch the image and ensure it's centered
    const imageParagraph = await this.createImageFromBase64(pdfImages1.footer, 420, 80, AlignmentType.CENTER);

    return new Footer({
      children: [
        this.horizontalLine(8),
        this.textLine(`CRN: ${CRN}`, 10, false, 0, 0, AlignmentType.CENTER),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [imageParagraph],
        }),
      ],
    });
  }

  // Common Footer
  async firstPageFooter(): Promise<Footer> {
    const footerImage1 = await this.createImageFromBase64(pdfImages1.footer, 420, 80, AlignmentType.CENTER);
    const footerImage2 = await this.createImageFromBase64(pdfImages1.footerImage, 180, 80, AlignmentType.RIGHT);

    return new Footer({
      children: [
        new Paragraph({
          children: [], // No content in this paragraph
          border: {
            bottom: {
              style: BorderStyle.THICK, // You can adjust the thickness
              size: 8, // Line thickness
              color: '#000000', // Line color
            },
          },
          spacing: { after: 10 }, // Space after the horizontal line
        }),

        new Table({
          rows: [
            new TableRow({
              children: [
                // Empty cell for spacing or alignment (matches PDF logic with left and right alignment)
                new TableCell({
                  children: [
                    this.textLine("", 0, false,)
                  ],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.BOTTOM,
                  margins: { top: 0, bottom: 0, left: 0, right: 0 },
                  borders: this.defaultBorders(0, 'none'), // No border for this cell
                }),

                // First image cell (centered image, matching the first PDF image)
                new TableCell({
                  children: [this.textLine(`CRN: ${CRN}`, 10, false, 0, 0, AlignmentType.CENTER), footerImage1],
                  width: { size: 50, type: WidthType.PERCENTAGE }, // 50% width
                  verticalAlign: VerticalAlign.BOTTOM,
                  margins: { top: 0, bottom: 0, left: 20, right: 0 },
                  borders: this.defaultBorders(0, 'none'), // No border for this cell
                }),

                // Second image cell (right-aligned image, matching the second PDF image)
                new TableCell({
                  children: [footerImage2],
                  width: { size: 25, type: WidthType.PERCENTAGE }, // 25% width
                  verticalAlign: VerticalAlign.BOTTOM,
                  margins: { top: 0, bottom: 0, left: 20, right: 0 },
                  borders: this.defaultBorders(0, 'none'), // No border for this cell
                }),
              ],
            }),
          ],
          layout: TableLayoutType.FIXED, // Fixed layout
          width: { size: 100, type: WidthType.PERCENTAGE }, // Full width of the page
        }),
      ],
    });
  }
  //****************************************************************** */
  firstPage(): (Paragraph | Table)[] {
    const title = this.pageTitle("TOB for Group International Medical Insurance", 15, "#000000", true, "center");

    // Line with left and right-aligned words (Ref and Date)
    const refAndDateTable = this.refAndDate();

    let greet = this.textLine('Valued Client,')

    // Information blocks 
    const infoBlock1 = this.createInfoBlock('Proposer name: ', `${this.transformedResultResponse.companyDetails.company_name.charAt(0).toUpperCase() + this.transformedResultResponse.companyDetails.company_name.slice(1)}`);
    const infoBlock2 = this.createInfoBlock('Insurance Period: ', `${this.transformedResultResponse?.companyDetails?.policyEffectiveDate} to ${this.transformedResultResponse?.companyDetails?.policy_end_date}\n`);
    const infoBlock3 = this.createInfoBlock("Cover: ", 'As per NLGIC standard Group Medical Expenses insurance policy wording, medical clauses, definitions, general provisions, and exclusions to cover the necessary, reasonable, and customary inpatient & outpatient medical expenses incurred by the insured members up to the benefits/limits mentioned in the attached TOB.');

    const textLine1 = this.textLine('"Insured Persons: All actively at work, full time & permanent employees of the Proposer and their eligible Family members."')


    const infoBlock4 = this.createInfoBlock('National Life and General Insurance Co SAOG (NLG) ', 'has been established since 1995. We are one of the major Health Insurance providers in the UAE market.\n')

    const textLine2 = this.textLine('NLGIC has been recognized as a Leader in the Corporate Medical Insurance Industry in the UAE, Oman, and Kuwait markets. With our expertise in \n')

    const texLine3 = this.textLine('Need-based underwriting and customized solutions, we have been successful in satisfying our clients. We always strive to work with the Customer First approach and believe that ‘Customer service is an Attitude and not a department.')

    const textLine4 = this.textLine('We have state-of-the-art policy administration and claims management services supporting our client-centric approach. In addition to our in-\n')

    const textLine5 = this.textLine('house network, we have also tied up with all the Major third-party administrators in UAE to cater to the varying needs of our clients. We are led by a well-experienced management team and have professionally qualified employees who are well trained to deliver the best to our Insured members.')

    const textline6 = this.textLine('Hoping that our quotation will meet your expectations. Line with the above, we would like to enlist our unique deliverables in service standards that differentiate us from our competitors.')

    const textLine7 = this.textLine('Please accept our best regards,')

    const infoBlock5 = this.createInfoBlock('National Life and General Insurance SAOG, ', 'Your Trusted Insurance Partner')

    const ul = [
      'Real time WhatsApp Chat facility for policy holder’s support.',
      'Dedicated SPOC for policies above 500 members.',
      'Instantaneous Response to Emergencies.',
      'Policy Setup and Activation within 3 working days.',
      'Certificate issuance on the same day as requested.',
      'Various modes available for claims submission including direct channel.',
      'Electronic (Bank Transfer) Claims settlement within 7 working days.'
    ].map(item => this.textLine(`• ${item}`, 10, false, 0, 0, AlignmentType.LEFT, "#000000"));

    return [
      title,
      refAndDateTable, greet, infoBlock1, infoBlock2, infoBlock3, textLine1, this.horizontalLine(10), textLine2, texLine3, textLine4, textLine5,
      infoBlock4, this.horizontalLine(10),
      textline6,
      ...ul,
      textLine7,
      infoBlock5

    ];
  }

  createInfoBlock(title: string, description: string): Paragraph {
    return new Paragraph({
      children: [
        // Title with bold style
        new TextRun({
          text: title,
          size: 20, // Adjust size as needed
          bold: true,
          color: "#000000",
          font: "Calibri",
        }),

        // Description right after the title (no line break in between)
        new TextRun({
          text: description,
          size: 20,
          bold: false,
          color: "#000000",
          font: "Calibri",
        }),
      ],
      spacing: { before: 100, after: 100 }, // Adjust spacing as needed
      alignment: AlignmentType.LEFT, // Alignment of the whole line
    });
  }


  // Helper function to create a line with left and right words
  refAndDate(): Table {
    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                this.textLine("Ref:", 10, true),
                this.textLine(CRN, 10, true)
              ],
              width: { size: 25, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.BOTTOM,
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
              borders: this.defaultBorders(0, 'none')
            }),

            new TableCell({
              children: [
                this.textLine(`Date: ${this.todaydate}`, 10, false, 0, 0, AlignmentType.RIGHT)
              ],
              width: { size: 25, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.BOTTOM,
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
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
    });
  }

  //****************************************************************** */
  // Basic Table
  basicTable(quoteData: any) {
    let basicTableData =
      [
        {
          label: 'Client / Policy Holder Name', value:
            quoteData.companyDetails.company_name
        },
        {
          label: 'Scheme Start Date/Renewal Date', value: quoteData.censusDetails.policy_start_date
        },
        { label: 'Scope of Coverage', value: 'As Per the Schedule of Benefits attached' },
        { label: 'Premium payment warranty', value: '100% of inception premium is due and payable in advance or at the day of inception cover' },
        {
          label: 'TPA name for Direct Billing', value:
            quoteData.quotes[0]?.data[0]?.data?.tpa?.tpa_name
        },
        {
          label: 'Proposal Number', value: `${quoteData.companyDetails.client_reference_number}/${quoteData.companyDetails?.version}`
        },
        { label: 'Quote Generated Date', value: this.quoteGeneratedDate },
        { label: 'Quote validity', value: '30 days from the quote generated date' },
        { label: 'Other provision and & conditions', value: 'Please refer to the Policy Wording document for definitions and the exclusion list' },
      ]

    let basicTableRows = [
      new TableRow({
        children: [
          this.CommonCell('Basic Details', { color: "#00587C", fontSize: 10, bold: true, width: { size: 35, type: "pct" }, alignment: AlignmentType.LEFT }),
          this.CommonCell("", { fontSize: 6, bold: false, width: { size: 65, type: "pct" } })
        ],
      }),
      ...basicTableData.map(({ label, value }) => this.createRow1(label, value)),
    ];

    return new Table({
      rows: basicTableRows,
      layout: TableLayoutType.FIXED,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
    });
  }
  createRow1 = (label: string, value: string | undefined) =>
    new TableRow({
      children: [
        this.CommonCell(label, { fontSize: 9, bold: false, width: { size: 35, type: "pct" } }),
        this.CommonCell(value || '', { fontSize: 9, bold: false, width: { size: 35, type: "pct" } }),
      ],
    });

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
            this.CommonCell("Quote 1", { fontSize: 11, color: "#ffffff", fillColor: '#b5b5b5', bold: true, width: { size: 33, type: "pct" } }), // First column
            this.CommonCell(
              `${(quote.quote_type[0].toUpperCase()) + ((quote.quote_type).slice(1))} Quote${quote.risk_type.toLowerCase() === "no" ? "" : ` & ${(quote.risk_type).toUpperCase()}`}`,
              {
                fontSize: 11,
                bold: true,
                color: "#ffffff", fillColor: '#b5b5b5',
                width: { size: 34, type: "pct" }
              }
            ),
            this.CommonCell(`${quote.currency} ${this.convertNumber(quote.option_premium)}`, { fontSize: 11, bold: true, color: "#ffffff", fillColor: '#b5b5b5', width: { size: 33, type: "pct" } }), // Third column
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
  //****************************************************************** */

  // All age band Tables 

  // age band table type 1
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
    const title = this.tableTitle(`${titleText} - ${categoryName}`, 11, "#000000");

    // Header Rows for the table
    const headers: TableRow[] = [
      new TableRow({
        children: [
          this.CommonCell("Age band", {
            fillColor: "#b5b5b5",
            color: "#ffffff",
            bold: true,
            fontSize: 8,
            rowSpan: 3,
            alignment: AlignmentType.CENTER
          }),
          this.CommonCell(
            tableType === "memberCount" ? "Member Count" :
              tableType === "grossPremium" ? "Gross Premium" : "Total Gross Premium",
            { fillColor: "#b5b5b5", color: "#ffffff", bold: true, fontSize: 8, colSpan: 5, alignment: AlignmentType.CENTER }
          ),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Employees", {
            fillColor: "#eeeeee",
            bold: true,
            fontSize: 8,
            colSpan: 2,
            alignment: AlignmentType.CENTER
          }),
          this.CommonCell("Dependents", {
            fillColor: "#eeeeee",
            bold: true,
            fontSize: 8,
            colSpan: 2,
            alignment: AlignmentType.CENTER
          }),
          this.CommonCell("Maternity", {
            fillColor: "#eeeeee",
            bold: true,
            fontSize: 8,
            rowSpan: 2,
            alignment: AlignmentType.CENTER
          }),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Male", { fillColor: "#eeeeee", fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell("Female", { fillColor: "#eeeeee", fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell("Male", { fillColor: "#eeeeee", fontSize: 8, alignment: AlignmentType.CENTER }),
          this.CommonCell("Female", { fillColor: "#eeeeee", fontSize: 8, alignment: AlignmentType.CENTER }),
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
          this.CommonCell("Age bracket", { fillColor: "#b5b5b5", color: "#ffffff", bold: true, fontSize: 8, rowSpan: 3, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Dubai", { fillColor: "#b5b5b5", color: "#ffffff", bold: true, fontSize: 8, colSpan: 5, width: { size: 16.67 * 5, type: "pct" }, alignment: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Member Count", { fillColor: "#eeeeee", bold: true, fontSize: 8, colSpan: 2, width: { size: 16.67 * 2, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Gross Premium per member", { fillColor: "#eeeeee", bold: true, fontSize: 8, colSpan: 2, width: { size: 16.67 * 2, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Total Gross Premium", { fillColor: "#eeeeee", bold: true, fontSize: 8, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Employees & Dependents", { fillColor: "#eeeeee", fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Maternity Eligible", { fillColor: "#eeeeee", fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Employees & Dependents excl. Maternity", { fillColor: "#eeeeee", fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Maternity Premium Per Eligible Female", { fillColor: "#eeeeee", fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Total", { fillColor: "#eeeeee", fontSize: 8, bold: true, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
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
          this.CommonCell("Age bracket", { fillColor: "#b5b5b5", color: "#ffffff", bold: true, fontSize: 8, rowSpan: 3, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Abhu Dhabi", { fillColor: "#b5b5b5", color: "#ffffff", bold: true, fontSize: 8, colSpan: 10, width: { size: 9.09 * 10, type: "pct" }, alignment: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Member Count", { fillColor: "#eeeeee", bold: true, fontSize: 8, colSpan: 3, width: { size: 9.09 * 3, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Gross Premium per member", { fillColor: "#eeeeee", bold: true, fontSize: 8, colSpan: 3, width: { size: 9.09 * 3, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Total Gross Premium", { fillColor: "#eeeeee", bold: true, fontSize: 8, colSpan: 4, width: { size: 9.09 * 3, type: "pct" }, alignment: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Employees", { fillColor: "#eeeeee", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Dependents", { fillColor: "#eeeeee", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Maternity", { fillColor: "#eeeeee", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Employees", { fillColor: "#eeeeee", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Dependents", { fillColor: "#eeeeee", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Maternity", { fillColor: "#eeeeee", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Employees", { fillColor: "#eeeeee", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Dependents", { fillColor: "#eeeeee", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Maternity", { fillColor: "#eeeeee", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
          this.CommonCell("Total", { fillColor: "#eeeeee", fontSize: 8, bold: true, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
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
          this.CommonCell("Age Band", { bold: true, color: "#ffffff", fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, rowSpan: 3 }),
          this.CommonCell("Employees", { bold: true, color: "#ffffff", colSpan: 3, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER }),
          this.CommonCell("Dependents", { bold: true, color: "#ffffff", colSpan: 3, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER }),
          this.CommonCell("Total", { bold: true, color: "#ffffff", colSpan: 6, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell(`Premium (${this.transformedResultResponse.quotes[0]?.currency})`, { bold: true, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, colSpan: 3 }),
          this.CommonCell(`Premium (${this.transformedResultResponse.quotes[0]?.currency})`, { bold: true, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, colSpan: 3 }),
          this.CommonCell("Member Count", { bold: true, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, colSpan: 3 }),
          this.CommonCell(`Premium (${this.transformedResultResponse.quotes[0]?.currency})`, { bold: true, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, colSpan: 3 }),

        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Single Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Married Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Single Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Married Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Single Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Married Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Single Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Married Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
        ],
      }),
    ];



    // Add data rows based on the details provided
    // Add data rows based on the details provided
    const dataRows: TableRow[] = details.map((row: any) => {
      let maleEmployeePremium = row?.member?.Employee?.malePremiumDisplay ? this.convertNumber(row?.member?.Employee?.malePremiumDisplay) : "";

      let singleFemaleEmployeePremium = row?.member?.Employee?.singleFemalePremiumDisplay ? this.convertNumber(row?.member?.Employee?.singleFemalePremiumDisplay) : "";

      let marriedFemaleEmployeePremium = row?.member?.Employee?.marriedFemalePremiumDisplay ? this.convertNumber(row?.member?.Employee?.marriedFemalePremiumDisplay) : "";

      let maleDependentsPremium = row?.member?.Dependents?.malePremiumDisplay ? this.convertNumber(row?.member?.Dependents?.malePremiumDisplay) : "";

      let singleFemaleDependentsPremium = row?.member?.Dependents?.singleFemalePremiumDisplay ? this.convertNumber(row?.member?.Dependents?.singleFemalePremiumDisplay) : "";

      let marriedFemaleDependentsPremium = row?.member?.Dependents?.marriedFemalePremiumDisplay ? this.convertNumber(row?.member?.Dependents?.marriedFemalePremiumDisplay) : "";

      let totalMale = row?.member?.totalMale ? this.convertNumber(row?.member?.totalMale) : "";

      let totalSingleFemale = row?.member?.totalSingleFemale ? this.convertNumber(row?.member?.totalSingleFemale) : "";

      let totalMarriedFemale = row?.member?.totalMarriedFemale ? this.convertNumber(row?.member?.totalMarriedFemale) : "";
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
        this.CommonCell("Total", { bold: true,color: "#ffffff", fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, colSpan: 7 }),
        this.CommonCell(`Members ${member}`, { bold: true, color: "#ffffff", fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, colSpan: 3 }),
        this.CommonCell(`Premium : ${this.convertNumber(premium)}`, { bold: true, color: "#ffffff", fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, colSpan: 3 }),

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
          this.CommonCell("Age Band", { bold: true, fontSize: 8, color: "#ffffff", fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, rowSpan: 3 }),
          this.CommonCell("Employees", { bold: true, fontSize: 8, color: "#ffffff", colSpan: 4, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER }),
          this.CommonCell("Dependents", { bold: true, fontSize: 8, color: "#ffffff", colSpan: 4, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER }),
          this.CommonCell("Total", { bold: true, fontSize: 8, color: "#ffffff", colSpan: 4, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Member Count", { bold: true, fontSize: 8, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, colSpan: 2 }),
          this.CommonCell(`Premium ${this.transformedResultResponse.quotes[0]?.currency}`, { bold: true, fontSize: 8, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, colSpan: 2 }),
          this.CommonCell("Member Count", { bold: true, fontSize: 8, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, colSpan: 2 }),
          this.CommonCell(`Premium ${this.transformedResultResponse.quotes[0]?.currency}`, { bold: true, fontSize: 8, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, colSpan: 2 }),
          this.CommonCell("Member Count", { bold: true, fontSize: 8, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, colSpan: 2 }),
          this.CommonCell(`Premium ${this.transformedResultResponse.quotes[0]?.currency}`, { bold: true, fontSize: 8, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, colSpan: 2 }),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
          this.CommonCell("Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER }),
        ],
      }),
    ];

    const dataRows: TableRow[] = details.map((row: any) => {

      let maleEmployeePremium = row?.member?.Employee?.malePremiumDisplay ? this.convertNumber(row?.member?.Employee?.malePremiumDisplay) : "";

      let femaleEmployeePremium = row?.member?.Employee?.femalePremiumDisplay ? this.convertNumber(row?.member?.Employee?.femalePremiumDisplay) : "";

      let maleDependentsPremium = row?.member?.Dependents?.malePremiumDisplay ? this.convertNumber(row?.member?.Dependents?.malePremiumDisplay) : "";

      let femaleDependentsPremium = row?.member?.Dependents?.femalePremiumDisplay ? this.convertNumber(row?.member?.Dependents?.femalePremiumDisplay) : "";

      let totalMale = row?.member?.totalMale ? this.convertNumber(row?.member?.totalMale) : "";

      let totalFemale = row?.member?.totalFemale ? this.convertNumber(row?.member?.totalFemale) : "";


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
        this.CommonCell("Total", { bold: true, color: "#ffffff", fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, colSpan: 9 }),
        this.CommonCell(`Members ${member}`, { bold: true, color: "#ffffff", fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, colSpan: 2 }),
        this.CommonCell(`Premium : ${this.convertNumber(premium)}`, { bold: true, color: "#ffffff", fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, colSpan: 2 }),

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

  // Benefits table
  // createBenefitsTable(organizedData: any) {
  //   if (Object.keys(organizedData).length === 0) {
  //     return [];
  //   }

  //   const tables: any[] = [];

  //   // Create the header row for categories only once, before the group detail rows
  //   const headerRow = new TableRow({
  //     children: [
  //       this.CommonCell("Benefits", {
  //         fontSize: 10,
  //         color: "#ffffff",
  //         fillColor: '#b5b5b5',
  //         bold: true,
  //         width: { size: this.columnWidth, type: "pct" },
  //       }),

  //       ...Array.from(new Set(Object.values(organizedData).flatMap((benefitsForGroup: any) => benefitsForGroup.map((benefit: any) => benefit.category_name))))
  //         .map((categoryName) =>
  //           this.CommonCell(categoryName, {
  //             fontSize: 10,
  //             color: "#ffffff",
  //             fillColor: '#b5b5b5',
  //             bold: true,
  //             width: { size: this.columnWidth, type: "pct" }
  //           })
  //         ),
  //     ],
  //   });

  //   // Add headerRow once to the table
  //   tables.push(new Table({
  //     rows: [headerRow],
  //     layout: TableLayoutType.FIXED,
  //     width: {
  //       size: 100,
  //       type: WidthType.PERCENTAGE,
  //     },
  //   }));

  //   // Loop through each group detail (e.g., "Policy Details")
  //   Object.keys(organizedData).forEach((groupDetail) => {
  //     const benefitsForGroup = organizedData[groupDetail];


  //     // Create group detail row with the group title, this will span all columns
  //     const groupDetailRow = new TableRow({
  //       children: [
  //         this.CommonCell(groupDetail, {
  //           fontSize: 10,
  //           bold: true,
  //           color: "#ffffff",
  //           fillColor: '#b5b5b5',
  //           width: { size: 100, type: "pct" },
  //           colSpan: 100 / this.columnWidth,
  //           alignment: AlignmentType.CENTER
  //         }),
  //       ],
  //     });

  //     // Create rows for each benefit
  //     const benefitRows: any[] = [];
  //     const benefitNames = Array.from(new Set(benefitsForGroup.map((benefit: any) => benefit.tob_header)));

  //     benefitNames.forEach((tob_header) => {
  //       const row = new TableRow({
  //         children: [
  //           this.CommonCell(String(tob_header), {
  //             fontSize: 10,
  //             bold: false,
  //             width: { size: this.columnWidth, type: "pct" },
  //           }),
  //           ...Array.from(new Set(benefitsForGroup.map((benefit: any) => benefit.category_name))).map((categoryName) => {
  //             // Find the benefit for the current category and benefit name
  //             const benefit = benefitsForGroup.find(
  //               (b: any) => b.tob_header === tob_header && b.category_name === categoryName
  //             );
  //             return this.CommonCell(benefit && benefit.tob_value ? benefit.tob_value : "N/A", {
  //               fontSize: 9,
  //               bold: false,
  //               width: { size: this.columnWidth, type: "pct" },
  //             });
  //           }),
  //         ],
  //       });
  //       benefitRows.push(row);
  //     });

  //     // Add group detail row and its benefit rows
  //     tables.push(
  //       new Table({
  //         rows: [groupDetailRow, ...benefitRows],
  //         // layout: TableLayoutType.FIXED,
  //         width: { size: 100, type: WidthType.PERCENTAGE },
  //       })
  //     );
  //   });

  //   return tables;
  // };

  createBenefitsTable(organizedData: any) {
    if (Object.keys(organizedData).length === 0) {
      return [];
    }

    const tables: any[] = [];

    // Create the header row for categories only once, before the group detail rows
    const headerRow = new TableRow({
      children: [
        this.CommonCell("Benefits", {
          fontSize: 10,
          color: "#ffffff",
          fillColor: "#b5b5b5",
          bold: true,
          width: { size: this.columnWidth, type: "pct" },
        }),
        ...Array.from(new Set(Object.values(organizedData).flatMap((benefitsForGroup: any) => benefitsForGroup.map((benefit: any) => benefit.category_name))))
          .map((categoryName) =>
            this.CommonCell(categoryName, {
              fontSize: 10,
              color: "#ffffff",
              fillColor: "#b5b5b5",
              bold: true,
              width: { size: this.columnWidth, type: "pct" },
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
          this.CommonCell(groupDetail, {
            fontSize: 10,
            bold: true,
            color: "#ffffff",
            fillColor: "#b5b5b5",
            width: { size: 100, type: "pct" },
            colSpan: 100 / this.columnWidth,
            alignment: AlignmentType.CENTER,
          }),
        ],
      });

      // Create rows for each benefit
      const benefitRows: any[] = [];
      const benefitNames = Array.from(new Set(benefitsForGroup.map((benefit: any) => benefit.tob_header)));

      benefitNames.forEach((tob_header, index) => {
        const row = new TableRow({
          children: [
            this.CommonCell(String(tob_header), {
              fontSize: 10,
              bold: false,
              width: { size: this.columnWidth, type: "pct" },
              fillColor: index % 2 === 0 ? "#ffffff" : "#eeeeee", // Alternate colors
            }),
            ...Array.from(new Set(benefitsForGroup.map((benefit: any) => benefit.category_name))).map((categoryName) => {
              // Find the benefit for the current category and benefit name
              const benefit = benefitsForGroup.find(
                (b: any) => b.tob_header === tob_header && b.category_name === categoryName
              );
              return this.CommonCell(benefit && benefit.tob_value ? benefit.tob_value : "N/A", {
                fontSize: 9,
                bold: false,
                width: { size: this.columnWidth, type: "pct" },
                fillColor: index % 2 === 0 ? "#ffffff" : "#eeeeee", // Alternate colors
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
          layout: TableLayoutType.FIXED,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
    });

    return tables;
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
        this.CommonCell('Premium', { fontSize: 10, bold: true, color: fontColor, fillColor: bgColor, width: { size: this.columnWidth, type: "pct" }, }), // First column for "Tob Header"
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

        // Skip convertNumber if the tobHeader is "Member count"
        return tobHeader === "Member count"
          ? tobValue // Return raw value for "Member count"
          : typeof tobValue === 'number'
            ? this.convertNumber(tobValue) // Format number for other headers
            : tobValue; // Return as-is for non-numeric values
      });

      return this.createRow3(tobHeader, values);
    });


    return [headerRow, ...dataRows];
  };


  createLandscapeSectionProperties() {
    return {
      properties: {
        page: {
          size: {
            orientation: PageOrientation.LANDSCAPE, // Set landscape orientation
          },
        },
      },
    };
  }


  async generateDocument(quoteData: any) {
    const header = await this.commonHeader()
    const firstPageHeader = await this.firstPageHeader()
    const footer = await this.commonFooter();
    const firstPageFooter = await this.firstPageFooter()

    let basicDetailsTable = this.basicTable(quoteData)

    // category member table 
    let categoryData = this.categoriesWithDetails(quoteData.allCensusData, quoteData.quotes[0].data, 'category');
    let categoriesDetailsTable = this.categoriesDetailTable(categoryData, quoteData)
    //****************************************************************** */
    // quote summary row 
    const summaryTable = this.createSummaryTable(quoteData.quotes[0]);

    //****************************************************************** */
    // category and Premium table 
    let extractedData = this.PremiumTableData(quoteData.quotes[0].data);
    const premiumTableRows1 = this.createPremiumTableRows(extractedData, "#FFFFFF", "#b5b5b5");


    //****************************************************************** */
    // Category and Benifits table
    const mandatoryBenefitsData = this.benefitsTableData(
      quoteData.quotes[0].data, 'mandatory_benefits');
    const optionalBenefitsData = this.benefitsTableData(
      quoteData.quotes[0].data, 'optional_benefits');
    const mandatoryBenefitsTable = this.createBenefitsTable(mandatoryBenefitsData);
    const optionalBenefitsTable = this.createBenefitsTable(optionalBenefitsData);

    //****************************************************************** */
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

    let exclusionData = this.formatExclusionData(quoteData.exclusion)
    let exclusion = this.createExclusionsSection(exclusionData)

    //****************************************************************** */
    const policyInsuranceRequirements1 = this.policyInsuranceRequirementList(policyInsuranceRequirement1);
    const policyInsuranceRequirements2 = this.policyInsuranceRequirementList(policyInsuranceRequirement2);
    //****************************************************************** */


    // Create the Word document
    const doc = new Document({

      sections: [
        {
          ...this.createLandscapeSectionProperties(),
          children: [
            ...this.firstPage()
          ],
          headers: {
            default: firstPageHeader,
          },
          footers: {
            default: firstPageFooter,
          }
        },

        {
          ...this.createLandscapeSectionProperties(),
          children: [
            summaryTable,
            this.tableTitle("Categories & Premium", 11, '#000000'),
            new Table({
              rows: premiumTableRows1,
              layout: TableLayoutType.FIXED,
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
            }),
            this.tableTitle("Categories & Benefits", 11, '#000000'),
            ...mandatoryBenefitsTable,
            ...optionalBenefitsTable
          ]
        },
        {
          ...this.createLandscapeSectionProperties(),
          children: [
            ...ageBandTables.flat(),
          ]
        },
        {
          ...this.createLandscapeSectionProperties(),
          children: [
            this.pageTitle("Terms and Conditions", 57, "00587C"),
            ...this.termsConditions
          ],
        },
        {
          ...this.createLandscapeSectionProperties(),
          children: [
            ...exclusion
          ],
        },

        {
          ...this.createLandscapeSectionProperties(),
          children:
            [
              this.pageTitle("Acceptance of Proposal & Acknowledgment of Responsibilities", 57, "#00587C"),
              this.textLine("I, the undersigned and duly authorized by my company hereby:", 18, false, 100, 100, AlignmentType.LEFT),
              ...this.acceptance,
              this.spaceParagraph,
              ...this.nameAndSign,
              this.textLine("Upon your confirmation, MEDGULF requires up to 5 working days from receipt of regulatory approvals along with all the below listed requirements:", 18, false, 100, 100, AlignmentType.LEFT)
            ],
        },
        {
          ...this.createLandscapeSectionProperties(),
          children:
            [
              this.pageTitle("Policy Issuance Requirements", 57, "00587C"),
              this.textLine("Upon your confirmation, MEDGULF requires up to 5 working days from receipt of regulatory approvals along with all the below listed requirements:", 18, false, 100, 100, AlignmentType.LEFT),
              ...policyInsuranceRequirements1,
              this.textLine("Should any assistance be needed, please do not hesitate to contact us via:", 18, false, 100, 100, AlignmentType.LEFT),
              ...policyInsuranceRequirements2
            ],
        },
        {
          ...this.createLandscapeSectionProperties(),
          children: [await this.createImageFromBase64(pdfImages.pdfFooterImg, 450, 220)],
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
