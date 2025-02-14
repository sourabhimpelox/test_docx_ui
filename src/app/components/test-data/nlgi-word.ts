import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { saveAs } from "file-saver";

import { AlignmentType, Document, ImageRun, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, Header, Footer, SimpleField, BorderStyle, VerticalAlign, SectionType, PageBreak, TableLayoutType, Alignment, PageOrientation, LevelFormat, PageSize } from 'docx';

import { CRN, quoteData, notesList, sanctionClauses, dubaiDocumentsPolicy, abuDhabiDocumentsPolicy, additionContent, deletionContent, NUMBERING_CONFIG, firstPageUnList, underWritingCriterias } from './data';
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
  // categoey details table data 

  formatNumber(value: any) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  formatDate(date: any) {
    return moment(date).format("DD MMM YYYY")
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
        premium: `${this.currency} ${this.formatNumber(category.data.totalPremium)}`,
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
      spacing: { after: 0, before: 0 },
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
  defaultBorders(size: number = 10, border: any = "single", color: string = "#000000") {
    return {
      top: { size: size, color: color, space: 0, style: border },
      bottom: { size: size, color: color, space: 0, style: border },
      left: { size: size, color: color, space: 0, style: border },
      right: { size: size, color: color, space: 0, style: border },
    };
  };

  // to add any line 
  textLine({
    text,
    size = 10,
    bold = false,
    before = 100,
    after = 100,
    alignment = AlignmentType.LEFT,
    color,
    leftIndent = 0, // Default no indent
  }: TextLineOptions): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: text,
          size: 2 * size,
          bold,
          color, // Optional color
          font: "Calibri",
        }),
      ],
      spacing: { before, after },
      alignment,
      indent: { left: leftIndent }, // Use the provided left indentation
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
      width,
      borderColor,
      marginRight = 20,
    } = options;

    // Split the text into segments while keeping the original line breaks
    const segments = String(text).split(/(\r\n\r\n|\r\n)/);
    const runs: TextRun[] = [];

    segments.forEach((segment, index) => {

      const cleanedSegment = segment.replace(/\t/g, ' ').trim();

      // If it's a line break, determine the type and add a small or larger break
      if (segment === "\r\n") {
        runs.push(new TextRun({ break: 1, size: fontSize * 1.5 })); // Small break
      } else if (segment === "\r\n\r\n") {
        runs.push(new TextRun({ break: 2, size: fontSize * 2.5 })); // Larger break
      } else if (segment.trim()) {
        // Add the actual text
        runs.push(
          new TextRun({
            text: cleanedSegment,
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
      borders: this.defaultBorders(10, "single", borderColor), // Default borders
      margins: { left: 20, top: 10, right: marginRight },
    });
  }

  // For Page Title
  pageTitle(title: string, size: number = 13, color: string = "#00587C", underline?: boolean, alignment: any = "left") {
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
    const leftImage = await this.createImageFromBase64(pdfImages1.headerLogo, 60, 60, AlignmentType.LEFT); // Left image
    const rightImage = await this.createImageFromBase64(pdfImages1.headerIcon, 120, 70, AlignmentType.RIGHT); // Right image

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
                  children: [this.textLine({ text: '', size: 0, bold: false, before: 0, after: 0, alignment: AlignmentType.CENTER })],
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
      ],
    });
  };

  firstPageHeader = async () => {
    const image = await this.createImageFromBase64(pdfImages1.logo, 600, 160, AlignmentType.CENTER); // Left image

    return new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [image],
        })
      ],
    });
  };
  //****************************************************************** */
  // Common Footer
  async commonFooter(): Promise<Footer> {
    // Fetch the image and ensure it's centered
    const imageParagraph = await this.createImageFromBase64(pdfImages1.footer, 500, 80, AlignmentType.CENTER);

    return new Footer({
      children: [
        this.horizontalLine(8),
        this.textLine({ text: `CRN: ${CRN}`, size: 10, bold: false, before: 0, after: 0, alignment: AlignmentType.CENTER })
        ,
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
                    this.textLine({ text: "", size: 0, bold: false, })
                  ],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.BOTTOM,
                  margins: { top: 0, bottom: 0, left: 0, right: 0 },
                  borders: this.defaultBorders(0, 'none'), // No border for this cell
                }),

                // First image cell (centered image, matching the first PDF image)
                new TableCell({
                  children: [this.textLine({ text: `CRN: ${CRN}`, size: 10, bold: false, before: 0, after: 0, alignment: AlignmentType.CENTER }), footerImage1],
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
  CommonCellBgColor(index: number, first: string = '#ffffff', next: string = '#eeeeee') {
    return index % 2 === 0 ? first : next
  }
  //****************************************************************** */

  createList(list: any): Paragraph[] {
    return list.map((item: ListItem) => {
      // Check if the item has a nested list
      if (item.nestedList && Array.isArray(item.nestedList) && item.nestedList.length > 0) {
        // Handle nested list
        const nestedParagraphs = item.nestedList.map((nestedItem) =>
          new Paragraph({
            children: [
              new TextRun({
                text: nestedItem.text,
                bold: nestedItem.bold ?? false, // Dynamically apply bold
              }),
            ],
            numbering: {
              reference: 'dynamic-dash',
              level: nestedItem.level,
            },
            alignment: AlignmentType.LEFT,
          })
        );

        // Add the parent item and then nested items
        return [
          new Paragraph({
            children: [
              new TextRun({
                text: item.text,
                bold: item.bold ?? false, // Dynamically apply bold
              }),
            ],
            numbering: {
              reference: 'dynamic-numbering',
              level: item.level,
            },
            alignment: AlignmentType.LEFT,
          }),
          ...nestedParagraphs, // Add nested items if they exist
        ];
      } else {
        // Handle regular item without nested list
        return new Paragraph({
          children: [
            new TextRun({
              text: item.text,
              bold: item.bold ?? false, // Dynamically apply bold
            }),
          ],
          numbering: item.type === 'number'
            ? { reference: 'dynamic-numbering', level: item.level }
            : item.type === 'dash'
              ? { reference: 'dynamic-dash', level: item.level }
              : { reference: 'dynamic-bullets', level: item.level },
          alignment: AlignmentType.LEFT,
        });
      }
    }).flat(); // Flatten the nested array
  }




  firstPage(): (Paragraph | Table)[] {
    const title = this.pageTitle("TOB for Group International Medical Insurance", 15, "#000000", true, "center");

    // Line with left and right-aligned words (Ref and Date)
    const refAndDateTable = this.refAndDate();

    let greet = this.textLine({ text: 'Valued Client,' })

    // Information blocks 
    const infoBlock1 = this.createInfoBlock('Proposer name: ', `${this.transformedResultResponse.companyDetails.company_name.charAt(0).toUpperCase() + this.transformedResultResponse.companyDetails.company_name.slice(1)}`, false, true, true);
    const infoBlock2 = this.createInfoBlock('Insurance Period: ', `${this.formatDate(this.transformedResultResponse?.companyDetails?.policyEffectiveDate)} to ${this.formatDate(this.transformedResultResponse?.companyDetails?.policy_end_date)}`);
    const infoBlock3 = this.createInfoBlock("Cover: ", 'As per NLGIC standard Group Medical Expenses insurance policy wording, medical clauses, definitions, general provisions, and exclusions to cover the necessary, reasonable, and customary inpatient & outpatient medical expenses incurred by the insured members up to the benefits/limits mentioned in the attached TOB.');

    const textLine1 = this.textLine({ text: '"Insured Persons: All actively at work, full time & permanent employees of the Proposer and their eligible Family members."' })


    const infoBlock4 = this.createInfoBlock('National Life and General Insurance Co SAOG (NLG) ', 'has been established since 1995. We are one of the major Health Insurance providers in the UAE market.\n')

    const textLine2 = this.textLine({ text: 'NLGIC has been recognized as a Leader in the Corporate Medical Insurance Industry in the UAE, Oman, and Kuwait markets. With our expertise in', leftIndent: 500 })

    const texLine3 = this.textLine({ text: 'Need-based underwriting and customized solutions, we have been successful in satisfying our clients. We always strive to work with the Customer First approach and believe that ‘Customer service is an Attitude and not a department.' })

    const textLine4 = this.textLine({ text: 'We have state-of-the-art policy administration and claims management services supporting our client-centric approach. In addition to our in-', leftIndent: 500 })

    const textLine5 = this.textLine({ text: 'house network, we have also tied up with all the Major third-party administrators in UAE to cater to the varying needs of our clients. We are led by a well-experienced management team and have professionally qualified employees who are well trained to deliver the best to our Insured members.' })

    const textline6 = this.textLine({ text: 'Hoping that our quotation will meet your expectations. Line with the above, we would like to enlist our unique deliverables in service standards that differentiate us from our competitors.' })

    const textLine7 = this.textLine({ text: 'Please accept our best regards,' })

    const infoBlock5 = this.createInfoBlock('National Life and General Insurance SAOG, ', 'Your Trusted Insurance Partner')

    const ulParagraphs = this.createList(firstPageUnList);
    return [
      title,
      refAndDateTable, greet, infoBlock1, infoBlock2, infoBlock3, textLine1, this.horizontalLine(10), infoBlock4, textLine2, texLine3, textLine4, textLine5,
      this.horizontalLine(10),
      textline6,
      ...ulParagraphs,
      textLine7,
      infoBlock5

    ];
  }

  createInfoBlock(title: string, description: string, bold1: boolean = true, bold2: boolean = false, underline: boolean = false): Paragraph {
    return new Paragraph({
      children: [
        // Title with bold style
        new TextRun({
          text: title,
          size: 20, // Adjust size as needed
          bold: bold1,
          color: "#000000",
          font: "Calibri",
        }),

        // Description right after the title (no line break in between)
        new TextRun({
          text: description,
          size: 20,
          bold: bold2,
          color: "#000000",
          font: "Calibri",
          underline: underline ? { type: "single" } : undefined,

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
                this.textLine({ text: "Ref:", size: 10, bold: true }),
                this.textLine({ text: `CRN: ${CRN}`, size: 10, bold: true })
              ],
              width: { size: 25, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.BOTTOM,
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
              borders: this.defaultBorders(0, 'none')
            }),

            new TableCell({
              children: [
                this.textLine({ text: `Date: ${this.formatDate(this.todaydate)}`, size: 10, bold: false, before: 0, after: 0, alignment: AlignmentType.RIGHT })
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

  // quote summary row 
  createSummaryTable(quote: any): Table {
    return new Table({
      rows: [
        new TableRow({
          children: [
            this.CommonCell("Quote 1", { fontSize: 11, color: "#ffffff", fillColor: '#b5b5b5', bold: true, width: { size: 33, type: "pct" }, alignment: AlignmentType.LEFT, borderColor: '#9e9e9e', }), // First column
            this.CommonCell(
              `${(quote.quote_type[0].toUpperCase()) + ((quote.quote_type).slice(1))} Quote`,
              {
                fontSize: 11,
                bold: true,
                color: "#ffffff", fillColor: '#b5b5b5',
                width: { size: 34, type: "pct" },
                alignment: AlignmentType.LEFT, borderColor: '#9e9e9e',
              }
            ),
            this.CommonCell(`${this.currency} ${this.formatNumber(quote.option_premium)}`, { fontSize: 11, bold: true, color: "#ffffff", fillColor: '#b5b5b5', width: { size: 33, type: "pct" }, alignment: AlignmentType.LEFT, borderColor: '#9e9e9e', }),
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
  // Policy Issuance Requirements
  // Function to create the unordered list with optional nested items
  policyInsuranceRequirementList(ul: Array<{ text: string; ul?: Array<{ text: string }> }>) {
    const listItems = ul.map(item => {
      const paragraph = new Paragraph({
        children: [
          new TextRun({
            text: `•  ${item.text}`,
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
                text: `•  ${nestedItem.text}`,
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
  createExclusionsSection(data: EmirateData[] | null): any {
    if (data.length === 0) {
      return []
    }
    const rows: TableRow[] = [];

    // Helper function to create a section header
    const createSectionHeader = (headerText: string): TableRow => {
      return new TableRow({
        children: [
          this.CommonCell(headerText, {
            alignment: AlignmentType.CENTER,
            fillColor: "#b5b5b5", // Background color
            bold: true,
            fontSize: 12,
            color: "#ffffff", // Text color
            borderColor: "#9e9e9e", // Border color
          }),
        ],
      });
    };

    // Helper function to process exclusions with conditions
    const processExclusions = (exclusions: Exclusion[]): Paragraph[] => {
      const paragraphs: Paragraph[] = [];

      exclusions.forEach((exclusion) => {
        // Determine if the heading should be bold
        const isBold = exclusion.title === "title";

        // Add the heading for each exclusion
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exclusion.heading,
                bold: isBold, // Apply bold condition
                size: 20,
                font: "Calibri",
              }),
            ],
            spacing: { before: 50 },
            indent: { left: 360 },
          })
        );

        // Add bullet points for each exclusion
        if (exclusion.bulletPoints.length > 0) {
          exclusion.bulletPoints.forEach((bulletPoint) => {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${bulletPoint}`,
                    size: 20,
                    font: "Calibri",
                  }),
                ],
                spacing: { before: 50 },
                indent: { left: 360 },
              })
            );
          });
        }
      });

      return paragraphs;
    };

    // Process each Emirate's exclusions and add them to the table
    data.forEach((emirateData) => {
      // Add a section header for General Exclusions
      rows.push(createSectionHeader('DHA & DOH Exclusions'));

      rows.push(
        new TableRow({
          children: [
            this.CommonCell('DXB Excluded (non-basic) healthcare services (DHA)', {
              alignment: AlignmentType.LEFT,
              fillColor: "#e0e0e0",
              bold: true,
              fontSize: 10,
              color: "#000000",
              borderColor: "#9e9e9e",
            }),
          ],
        })
      );
      // Process the exclusions for the Emirate
      const exclusionParagraphs = processExclusions(emirateData.exclusions);

      // Add the exclusions to a single table cell
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: exclusionParagraphs,
              shading: { fill: "#ffffff" },
              borders: this.defaultBorders(10, "single", "#9e9e9e"),
            }),
          ],
        })
      );
    });

    // Construct the table
    return new Table({
      rows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      layout: TableLayoutType.FIXED,
    });
  }

  //****************************************************************** */
  // All age band Tables 
  AgeBandTable4(category: any, premium: any, member: any) {
    let details = category.ageValues
    const pageBreak = new Paragraph({
      children: [],
      pageBreakBefore: true,
    });

    const title = this.pageTitle(`Age Band - ${category.emirate} - ${category.category_name}`, 10, '#000000');

    const headers = [
      new TableRow({
        children: [
          this.CommonCell("Age Band", { bold: true, color: "#ffffff", fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', rowSpan: 3 }),
          this.CommonCell("Employees", { bold: true, color: "#ffffff", colSpan: 2, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Dependents", { bold: true, color: "#ffffff", colSpan: 2, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Total", { bold: true, color: "#ffffff", colSpan: 4, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell(`Premium (${this.currency})`, { bold: true, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', colSpan: 2 }),
          this.CommonCell(`Premium (${this.currency})`, { bold: true, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', colSpan: 2 }),
          this.CommonCell("Member Count", { bold: true, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', colSpan: 2 }),
          this.CommonCell(`Premium (${this.currency})`, { bold: true, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', colSpan: 2 }),

        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
        ],
      }),
    ];

    // Add data rows based on the details provided

    const dataRows: TableRow[] = details.map((row: any) => {
      let maleEmployeePremium = row?.member?.Employee?.malePremiumDisplay ? this.formatNumber(row?.member?.Employee?.malePremiumDisplay) : "-";

      // let singleFemaleEmployeePremium = row?.member?.Employee?.singleFemalePremiumDisplay ? this.formatNumber(row?.member?.Employee?.singleFemalePremiumDisplay) : "";

      let marriedFemaleEmployeePremium = row?.member?.Employee?.marriedFemalePremiumDisplay ? this.formatNumber(row?.member?.Employee?.marriedFemalePremiumDisplay) : "-";

      let maleDependentsPremium = row?.member?.Dependents?.malePremiumDisplay ? this.formatNumber(row?.member?.Dependents?.malePremiumDisplay) : "-";

      // let singleFemaleDependentsPremium = row?.member?.Dependents?.singleFemalePremiumDisplay ? this.formatNumber(row?.member?.Dependents?.singleFemalePremiumDisplay) : "";

      let marriedFemaleDependentsPremium = row?.member?.Dependents?.marriedFemalePremiumDisplay ? this.formatNumber(row?.member?.Dependents?.marriedFemalePremiumDisplay) : "-";

      let totalMale = row?.member?.totalMale ? this.formatNumber(row?.member?.totalMale) : "";

      let totalSingleFemale = row?.member?.totalSingleFemale ? this.formatNumber(row?.member?.totalSingleFemale) : "";

      let totalMarriedFemale = row?.member?.totalMarriedFemale ? this.formatNumber(row?.member?.totalMarriedFemale) : "";

      // const totalSingleFemaleNum = totalSingleFemale ? parseFloat(totalSingleFemale.replace(/,/g, "")) : totalSingleFemale;
      // const totalMarriedFemaleNum = totalMarriedFemale ? parseFloat(totalMarriedFemale.replace(/,/g, "")) : totalMarriedFemale;

      // // Add the numbers
      // let totalFemale = totalSingleFemaleNum + totalMarriedFemaleNum; 
      // const formattedTotalFemale = totalFemale ? this.formatNumber(totalFemale) : totalFemale;

      const totalSingleFemaleNum = totalSingleFemale
        ? parseFloat(totalSingleFemale.toString().replace(/,/g, "")) || 0
        : 0;

      const totalMarriedFemaleNum = totalMarriedFemale
        ? parseFloat(totalMarriedFemale.toString().replace(/,/g, "")) || 0
        : 0;

      // Add the numbers
      const totalFemale = totalSingleFemaleNum + totalMarriedFemaleNum;

      // Format only if it's a valid number
      const formattedTotalFemale = !isNaN(totalFemale) ? this.formatNumber(totalFemale) : "0.00";


      return new TableRow({
        children: [
          this.CommonCell(row.age || '', { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(maleEmployeePremium, { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(marriedFemaleEmployeePremium, { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(maleDependentsPremium, { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(marriedFemaleDependentsPremium, { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(row?.member?.maleMemberCount || '', { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(row?.member?.singleFemaleMemberCount + row?.member?.marriedFemaleMembeCount || '', { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(totalMale, { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(formattedTotalFemale, { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),

        ],
      });
    });

    const totalRow = new TableRow({
      children: [
        this.CommonCell("Total", { bold: true, color: "#ffffff", fillColor: "#b5b5b5", alignment: AlignmentType.RIGHT, borderColor: '#9e9e9e', colSpan: 5, marginRight: 150 }),
        this.CommonCell(`Members: ${member}`, { bold: true, color: "#ffffff", fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', colSpan: 2 }),
        this.CommonCell(`Premium: ${premium}`, { bold: true, color: "#ffffff", fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', colSpan: 2 }),

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
  AgeBandTable3(category: any, premium: any, member: any) {
    let details = category.ageValues
    const pageBreak = new Paragraph({
      children: [],
      pageBreakBefore: true,
    });

    const title = this.pageTitle(`Age Band - ${category.emirate} - ${category.category_name}`, 10, '#000000');

    const headers = [
      new TableRow({
        children: [
          this.CommonCell("Age Band", { bold: true, fontSize: 8, color: "#ffffff", fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', rowSpan: 3 }),
          this.CommonCell("Employees", { bold: true, fontSize: 8, color: "#ffffff", colSpan: 4, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Dependents", { bold: true, fontSize: 8, color: "#ffffff", colSpan: 4, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Total", { bold: true, fontSize: 8, color: "#ffffff", colSpan: 4, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Member Count", { bold: true, fontSize: 8, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', colSpan: 2 }),
          this.CommonCell(`Premium ${this.currency}`, { bold: true, fontSize: 8, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', colSpan: 2 }),
          this.CommonCell("Member Count", { bold: true, fontSize: 8, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', colSpan: 2 }),
          this.CommonCell(`Premium ${this.currency}`, { bold: true, fontSize: 8, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', colSpan: 2 }),
          this.CommonCell("Member Count", { bold: true, fontSize: 8, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', colSpan: 2 }),
          this.CommonCell(`Premium ${this.currency}`, { bold: true, fontSize: 8, fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', colSpan: 2 }),
        ],
      }),
      new TableRow({
        children: [
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Male", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
          this.CommonCell("Female", { bold: false, fontSize: 8, fillColor: "#eeeeee", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
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
          this.CommonCell(row?.age || '', { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(row?.member?.Employee?.maleCount || '', { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(row?.member?.Employee?.femaleCount || '', { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(maleEmployeePremium, { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(femaleEmployeePremium, { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(row?.member?.Dependents?.maleCount || '', { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(row?.member?.Dependents?.femaleCount || '', { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(maleDependentsPremium, { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(femaleDependentsPremium, { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(row?.member?.maleMemberCount || '', { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(row?.member?.femaleMemberCount || '', { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(totalMale || '', { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell(totalFemale, { fontSize: 8, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
        ],
      });
    });


    const totalRow = new TableRow({
      children: [
        this.CommonCell("Total", { bold: true, color: "#ffffff", fillColor: "#b5b5b5", alignment: AlignmentType.RIGHT, borderColor: '#9e9e9e', colSpan: 9, marginRight: 150 }),
        this.CommonCell(`Members: ${member}`, { bold: true, color: "#ffffff", fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', colSpan: 2 }),
        this.CommonCell(`Premium: ${premium}`, { bold: true, color: "#ffffff", fillColor: "#b5b5b5", alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', colSpan: 2 }),

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

          this.CommonCell("S.No", { fontSize: 10, bold: true, width: { size: 4, type: "pct" }, color: "#ffffff", fillColor: '#b5b5b5', alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell("Employee Id", { fontSize: 10, bold: true, width: { size: 13, type: "pct" }, color: "#ffffff", fillColor: '#b5b5b5', alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell("Employee Name", { fontSize: 10, bold: true, width: { size: 25, type: "pct" }, color: "#ffffff", fillColor: '#b5b5b5', alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell("Relations", { fontSize: 10, bold: true, width: { size: 13, type: "pct" }, color: "#ffffff", fillColor: '#b5b5b5', alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell("Age", { fontSize: 10, bold: true, width: { size: 4, type: "pct" }, color: "#ffffff", fillColor: '#b5b5b5', alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell("Premium", { fontSize: 10, bold: true, width: { size: 15, type: "pct" }, color: "#ffffff", fillColor: '#b5b5b5', alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell("Category", { fontSize: 10, bold: true, width: { size: 12, type: "pct" }, color: "#ffffff", fillColor: '#b5b5b5', alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          this.CommonCell("Member Type", { fontSize: 10, bold: true, width: { size: 14, type: "pct" }, color: "#ffffff", fillColor: '#b5b5b5', alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
        ],
      })
    );

    // Add Census Data Rows
    category.census.forEach((census: any, index: number) => {
      rows.push(
        new TableRow({
          children: [
            this.CommonCell((index + 1).toString(), { fontSize: 10, bold: false, width: { size: 4, type: "pct" }, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
            this.CommonCell(String(census.employee_id), { fontSize: 10, bold: false, width: { size: 13, type: "pct" }, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
            this.CommonCell(census.employee_name, { fontSize: 10, bold: false, width: { size: 25, type: "pct" }, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
            this.CommonCell(census.relations, { fontSize: 10, bold: false, width: { size: 13, type: "pct" }, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
            this.CommonCell(census.age.toString(), { fontSize: 10, bold: false, width: { size: 4, type: "pct" }, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
            this.CommonCell(`${this.currency} ${this.formatNumber(census.updated_loaded_premium)}`, { fontSize: 10, bold: false, width: { size: 15, type: "pct" }, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
            this.CommonCell(census.category.toUpperCase(), { fontSize: 10, bold: false, width: { size: 12, type: "pct" }, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
            this.CommonCell(census.member_type, { fontSize: 10, bold: false, width: { size: 14, type: "pct" }, alignment: AlignmentType.CENTER, borderColor: '#9e9e9e', }),
          ],
        })
      );
    });

    let title = this.pageTitle(`MAF Required Members - ${category.category_name}`, 10, '#000000')

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

  checkSingleFemalePremiumDisplay(arr: any[]): boolean {
    if (arr.length === 0) {
      return false;
    }

    const firstObject = arr[0];
    // Safely access the properties using optional chaining
    const singleFemalePremiumDisplay =
      firstObject?.member?.Dependents?.singleFemalePremiumDisplay ||
      firstObject?.member?.Employee?.singleFemalePremiumDisplay;

    return Boolean(singleFemalePremiumDisplay);
  }
  //****************************************************************** */

  formMandatoryBenefits(quote) {
    const headers = [];

    if (!quote || !Array.isArray(quote)) {
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

  generateDynamicBenefitsTable(quote) {
    // Initialize table rows
    const tableRows = [];

    // Add the header row
    const headerRow = new TableRow({
      children: [
        this.CommonCell("Benefits", {
          fontSize: 10,
          color: "#ffffff",
          fillColor: "#b5b5b5",
          borderColor: '#9e9e9e',
          bold: true,
          alignment: AlignmentType.LEFT,
          width: { size: this.columnWidth, type: "pct" },
        }),
        ...quote.map((cat) =>
          this.CommonCell(cat.category_name, {
            fontSize: 10,
            color: "#ffffff",
            fillColor: "#b5b5b5",
            borderColor: '#9e9e9e',
            bold: true,
            alignment: AlignmentType.LEFT,
            width: { size: this.columnWidth, type: "pct" }
          })
        ),
      ],
    });
    tableRows.push(headerRow);

    // Form mandatory benefits
    const mandatoryHeaders = this.formMandatoryBenefits(quote);
    this.addBenefitRows(mandatoryHeaders, quote, tableRows);

    // Form optional benefits
    const optionalHeaders = this.formOptionalBenefits(quote);
    if (optionalHeaders.length > 0) {
      this.addBenefitRows(optionalHeaders, quote, tableRows);
    }

    // Create the table
    const benefitsTable = new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
    });

    return benefitsTable;
  }

  addBenefitRows(headers, quote, tableRows) {
    // Group headers by their group name
    const groupedHeaders = _.groupBy(headers, "group");

    // Iterate over each group
    Object.entries(groupedHeaders).forEach(([groupName, groupHeaders]) => {
      // Add the group header row
      tableRows.push(
        new TableRow({
          children: [
            this.CommonCell(groupName, {
              fontSize: 10,
              bold: true,
              color: "#ffffff",
              fillColor: "#b5b5b5",
              borderColor: '#9e9e9e',
              alignment: AlignmentType.LEFT,
              width: { size: 100, type: "pct" },
              colSpan: 100 / this.columnWidth
            })
          ],
        })
      );

      // Add rows for each header in the group
      groupHeaders.forEach((header, index) => {
        const rowCells = [
          this.CommonCell(header.header, {
            fontSize: 10,
            bold: false,
            width: { size: this.columnWidth, type: "pct" },
            fillColor: this.CommonCellBgColor(index, '#ffffff', '#eeeeee'), borderColor: '#9e9e9e',
          }),
          ...quote.map((category) => {
            const value = this.getBenefitValueByCategory(header, category);
            return this.CommonCell(value || "N/A", {
              fontSize: 9,
              bold: false,
              width: { size: this.columnWidth, type: "pct" },
              fillColor: this.CommonCellBgColor(index, '#ffffff', '#eeeeee'), borderColor: '#9e9e9e'
            });
          }),
        ];
        tableRows.push(new TableRow({ children: rowCells }));
      });
    });
  }


  //****************************************************************** */

  // category and Premium table 
  createRow3 = (tobHeader: string, values: string[], rowIndex: number): TableRow =>
    new TableRow({
      children: [
        this.CommonCell(tobHeader, { fontSize: 10, bold: false, width: { size: this.columnWidth, type: "pct" }, borderColor: '#9e9e9e', fillColor: this.CommonCellBgColor(rowIndex, '#eeeeee', '#ffffff') }), // First column for "Tob Header"
        ...values.map(value => this.CommonCell(value, { fontSize: 9, bold: false, width: { size: this.columnWidth, type: "pct" }, borderColor: '#9e9e9e', fillColor: this.CommonCellBgColor(rowIndex, '#eeeeee', '#ffffff') })), // Other columns for categories
      ],
    });

  createPremiumTableRows = (data: Category[], fontColor: any, bgColor: any): TableRow[] => {
    // Extract the tob_headers (unique keys in each category)
    const tobHeaders = data[0].premium_details.map((item: PremiumDetail, index) => item.tob_header);

    // First row is the header row (Tob Header and categories)
    const headerRow = new TableRow({
      children: [
        this.CommonCell('Premium', { fontSize: 10, bold: true, color: fontColor, fillColor: bgColor, width: { size: this.columnWidth, type: "pct" }, alignment: AlignmentType.LEFT, borderColor: '#9e9e9e', }), // First column for "Tob Header"
        ...data.map(category => this.CommonCell(category.category_name, { fontSize: 10, color: fontColor, fillColor: bgColor, bold: true, width: { size: this.columnWidth, type: "pct" }, alignment: AlignmentType.LEFT, borderColor: '#9e9e9e', })), // Columns for categories
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

    const dataRows = Array.from(uniqueTobHeaders.keys()).map((tobHeader: string, rowIndex: number) => {
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

      return this.createRow3(tobHeader, values, rowIndex);
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

  additionAndDeletionClauseTable(): Table {
    const rows: TableRow[] = [];

    // Helper function to create section headers
    const createSectionHeader = (headerText: string): TableRow => {
      return new TableRow({
        children: [
          this.CommonCell(headerText, {
            fontSize: 12,
            bold: true,
            color: "#ffffff",
            fillColor: "#b5b5b5",
            alignment: AlignmentType.CENTER,
            colSpan: 1,
            borderColor: '#9e9e9e'
          }),
        ],
      });
    };

    // Function to process content with createTextRun for boldText
    const processContent = (contentArray: any[]) => {
      contentArray.forEach((content, index) => {
        const cellBgColor = this.CommonCellBgColor(index, '#eeeeee', '#ffffff');

        if (typeof content === "string") {
          // Single text content
          rows.push(
            new TableRow({
              children: [
                this.CommonCell(content, {
                  fontSize: 10,
                  fillColor: cellBgColor,
                  alignment: AlignmentType.LEFT,
                  borderColor: '#9e9e9e'
                }),
              ],
            })
          );
        } else if (content.ul) {

          const clause = this.createList(content.ul);
          rows.push(
            new TableRow({
              children: [
                new TableCell({
                  children: clause, // Add the paragraphs generated from listContent
                  shading: { fill: "#eeeeee" },
                  borders: this.defaultBorders(10, 'single', '#9e9e9e'),
                }),
              ],
            })
          )
        } else if (content.boldText) {
          // Bold text content using createTextRun for each bold item
          const boldTextParagraphs = content.boldText.map((boldItem: string) => {
            return new Paragraph({
              children: [this.createTextRun(`${boldItem}`, true)], // Create a bold TextRun
              indent: { left: 300 }
            });
          });

          rows.push(
            new TableRow({
              children: [
                new TableCell({
                  children: boldTextParagraphs,
                  shading: { fill: cellBgColor },
                  borders: this.defaultBorders(10, 'single', '#9e9e9e')
                }),
              ],
            })
          );
        }
      });
    };

    // Add Addition Clause to the table
    rows.push(createSectionHeader("Addition Clause"));
    processContent(additionContent);

    // Add Deletion Clause to the table
    rows.push(createSectionHeader("Deletion Clause"));
    processContent(deletionContent);

    // Construct the table
    return new Table({
      rows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      layout: TableLayoutType.FIXED,
    });
  }

  createTextRun(text: string, italics?: boolean): TextRun {
    return new TextRun({ text: `${text}`, size: 2 * 9, italics });
  };

  //****************************************************************** */

  //underwriting Section

  underwritingSection() {
    const rows: TableRow[] = [];

    // Create the header as a paragraph
    const headerParagraph = new Paragraph({
      children: [
        new TextRun({
          text: 'Underwriting Criteria:',
          size: 20,
          bold: true,
        }),
      ],
      indent: {
        left: 50,
      },
      alignment: 'left',
    })



    // Generate the paragraphs from the list
    const underWritingParagraphs = this.createList(underWritingCriterias);

    // Combine header and list content in a single TableCell
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [headerParagraph, ...underWritingParagraphs], // Both header and list are inside one cell
            shading: { fill: "#ffffff" },
            borders: this.defaultBorders(10, 'single', '#9e9e9e'),
          }),
        ],
      })
    );

    return new Table({
      rows: rows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      layout: TableLayoutType.FIXED,
    });
  }

  renderNotes() {
    const rows: TableRow[] = [];

    // Helper function to create a section header
    const createSectionHeader = (headerText: string, backgroundColor: string): TableRow => {
      return new TableRow({
        children: [
          this.CommonCell(headerText, {
            alignment: AlignmentType.CENTER,
            color: "#ffffff",
            fillColor: backgroundColor,
            bold: true,
            borderColor: '#9e9e9e',
          }),
        ],
      });
    };

    // Add the main header
    rows.push(createSectionHeader("Notes", "#b5b5b5"));

    // Process list content into paragraphs
    const noteParagraphs = this.createList(notesList); // This now generates the paragraphs with appropriate numbering and nesting

    // Add the paragraphs to a table row
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: noteParagraphs, // Add the paragraphs generated from listContent
            shading: { fill: "#eeeeee" },
            borders: this.defaultBorders(10, 'single', '#9e9e9e'),
          }),
        ],
      })
    );

    // Create the table with the rows and return it
    return new Table({
      rows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      layout: TableLayoutType.FIXED,
    });
  }


  renderSanctionsClause() {
    const rows: TableRow[] = [];

    // Adding the header row for Sanctions Clause
    rows.push(
      new TableRow({
        children: [
          this.CommonCell('Sanctions Clause', { bold: true, color: "#ffffff", fillColor: '#b5b5b5', alignment: AlignmentType.CENTER, borderColor: '#9e9e9e' }),
        ],
      })
    );

    // Adding clause rows
    sanctionClauses.forEach((clause, index) => {
      rows.push(
        new TableRow({
          children: [
            this.CommonCell(clause, { fillColor: this.CommonCellBgColor(index, '#eeeeee', '#ffffff'), borderColor: '#9e9e9e' }),
          ],
        })
      );
    });

    return new Table({
      rows: rows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      layout: TableLayoutType.FIXED,
    });
  }

  renderDocIssuePolicy() {
    const rows: TableRow[] = [];

    // Header for the document
    rows.push(
      new TableRow({
        children: [
          this.CommonCell('Required documents to issue the policy', {
            bold: true,
            color: '#ffffff',
            alignment: AlignmentType.CENTER,
            fillColor: '#b5b5b5',
            borderColor: '#9e9e9e'
          }),
        ],
      })
    );

    // Clients based in Dubai and Northern Emirates
    rows.push(
      new TableRow({
        children: [
          this.CommonCell('Clients based in Dubai and Northern Emirates', {
            alignment: AlignmentType.LEFT,
            fillColor: '#eeeeee',
            borderColor: '#9e9e9e'
          }),
        ],
      })
    );

    // Documents for Dubai clients (using createParagraphs for list)
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: this.createList(dubaiDocumentsPolicy), // Use createParagraphs here
            shading: { fill: "#ffffff" },
            borders: this.defaultBorders(10, 'single', '#9e9e9e'),
          }),
        ],
      })
    );

    // Clients based in Abu Dhabi
    rows.push(
      new TableRow({
        children: [
          this.CommonCell('Clients based in Abu Dhabi:', {
            alignment: AlignmentType.LEFT,
            fillColor: '#eeeeee',
            borderColor: '#9e9e9e'
          }),
        ],
      })
    );

    // Documents for Abu Dhabi clients (using createParagraphs for list)
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: this.createList(abuDhabiDocumentsPolicy), // Use createParagraphs here
            shading: { fill: "#ffffff" },
            borders: this.defaultBorders(10, 'single', '#9e9e9e'),
          }),
        ],
      })
    );

    return new Table({
      rows: rows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      layout: TableLayoutType.FIXED,
    });
  }

  //****************************************************************** */

  async generateDocument(quoteData: any) {

    const header = await this.commonHeader()
    const firstPageHeader = await this.firstPageHeader()

    const footer = await this.commonFooter();
    const firstPageFooter = await this.firstPageFooter()

    const combinedClauseTable = this.additionAndDeletionClauseTable();
    const underWritingTable = this.underwritingSection();

    const NotesTable = this.renderNotes()

    let sanctionsClauseTable = this.renderSanctionsClause()

    let renderDocIssuePolicyTable = this.renderDocIssuePolicy()

    //****************************************************************** */
    // quote summary row 
    const summaryTable = this.createSummaryTable(quoteData.quotes[0]);

    //****************************************************************** */
    // category and Premium table 
    let extractedData = this.PremiumTableData(quoteData.quotes[0].data);
    const premiumTableRows1 = this.createPremiumTableRows(extractedData, "#FFFFFF", "#b5b5b5");


    //****************************************************************** */
    // Category and Benifits table
    let categoryBenefitsTable = await this.generateDynamicBenefitsTable(quoteData.quotes[0].data)

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


      if (isSingleFemalePremiumDisplayExist) {
        ageBandTable = this.AgeBandTable4(category, category.premium, category.totalMemberCount)
      } else {
        ageBandTable = this.AgeBandTable3(category, category.premium, category.totalMemberCount)
      }


      content.push(...ageBandTable);
      return content;
    });

    let exclusionData = this.formatExclusionData(quoteData.exclusion)
    let exclusionTable = this.createExclusionsSection(exclusionData)


    //****************************************************************** */

    const exclusionTableSection = exclusionData.length > 0
      ? {
        ...this.createLandscapeSectionProperties(),
        children: [exclusionTable],
      }
      : null;

    // Create the Word document
    const doc = new Document({
      numbering: {
        config: [
          { reference: 'dynamic-numbering', levels: NUMBERING_CONFIG.dynamicNumbering },
          { reference: 'dynamic-bullets', levels: NUMBERING_CONFIG.dynamicBullets },
          { reference: 'dynamic-dash', levels: NUMBERING_CONFIG.dynamicDash },

        ],
      },

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
            categoryBenefitsTable
          ],
          headers: {
            default: header,
          },
          footers: {
            default: footer,
          }
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
            underWritingTable,
            combinedClauseTable,
          ],
        },
        ...(exclusionTableSection ? [exclusionTableSection] : []),
        {
          ...this.createLandscapeSectionProperties(),
          children: [
            NotesTable,
            sanctionsClauseTable,
            renderDocIssuePolicyTable
          ],
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
