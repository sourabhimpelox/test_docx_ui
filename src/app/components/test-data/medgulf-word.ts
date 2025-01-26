import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { saveAs } from "file-saver";

import { AlignmentType, Document, ImageRun, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, Header, Footer, SimpleField, BorderStyle, VerticalAlign, SectionType, PageBreak, TableLayoutType } from 'docx';

import { CRN, quoteData, basicTableData, termsAndConditions, acceptanceAndAcknowledgment, NameAndSignature, policyInsuranceRequirement1, policyInsuranceRequirement2 } from './data';
import { pdfImages } from './images';

import { PremiumDetail, Category, CensusCategory, Exclusion, EmirateData, PdfAgeBandDetail, agebandData, CellOptions } from './interfaces'


@Component({
  selector: 'app-test-data',
  templateUrl: './test-data.component.html',
  styleUrls: ['./test-data.component.css']
})

export class TestDataComponent {

  constructor(private http: HttpClient) { }
  totalCategoryCount: number = 0
  quotesData: any = quoteData

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
  extractedData = this.PremiumTableData(quoteData.quotes[0].data);

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
        pdfAgeBandDetails: category.pdfAgeBandDetails || [],
        pdfAgeBandDetailsUnify: category.pdfAgeBandDetailsUnify || [],
        census: category.census,
        emirate: category.data.emirates.emirates_name,
        tpa: category.data.tpa.tpa_name
      }
    });
  }

  // exclusion data 
  formatExclusionData(exclusionData?: any) {
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

  async generateDocument() {
    function buildTableRows() {
      const rows = [];

      // Header row
      rows.push(
        new TableRow({
          children: [
            CommonCell("Age Band", { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, rowSpan: 3 }),
            CommonCell("Employees", { bold: true, colSpan: 4, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER }),
            CommonCell("Dependents", { bold: true, colSpan: 4, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER }),
            CommonCell("Total", { bold: true, colSpan: 4, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER }),
          ],
        })
      );

      rows.push(
        new TableRow({
          children: [
            CommonCell("Member Count", { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 2 }),
            CommonCell(`Premium`, { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 2 }),
            CommonCell("Member Count", { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 2 }),
            CommonCell(`Premium`, { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 2 }),
            CommonCell("Member Count", { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 2 }),
            CommonCell(`Premium`, { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 2 }),
          ],
        })
      );

      // Sub-header row
      rows.push(
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
        })
      );

      // Add data rows (example data)
      const data = [
        { age: "20-30", maleEmployeeCount: 10, femaleEmployeeCount: 15, malePremium: 100, femalePremium: 120 },
        { age: "30-40", maleEmployeeCount: 8, femaleEmployeeCount: 12, malePremium: 150, femalePremium: 180 },
      ];

      data.forEach((row) => {
        rows.push(
          new TableRow({
            children: [
              CommonCell(row.age),
              CommonCell(String(row.maleEmployeeCount)),
              CommonCell(String(row.femaleEmployeeCount)),
              CommonCell(String(row.malePremium)),
              CommonCell(String(row.femalePremium)),
            ],
          })
        );
      });

      return rows;
    }


    function buildTableRows2() {
      const rows = [];

      // Header row
      rows.push(
        new TableRow({
          children: [
            CommonCell("Age Band", { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, rowSpan: 3 }),
            CommonCell("Employees", { bold: true, colSpan: 3, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER }),
            CommonCell("Dependents", { bold: true, colSpan: 3, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER }),
            CommonCell("Total", { bold: true, colSpan: 6, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER }),
          ],
        })
      );

      rows.push(
        new TableRow({
          children: [
            CommonCell(`Premium`, { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 3 }),
            CommonCell(`Premium`, { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 3 }),
            CommonCell("Member Count", { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 3 }),
            CommonCell(`Premium`, { bold: true, fillColor: "#B7B5CF", alignment: AlignmentType.CENTER, colSpan: 3 }),

          ],
        })
      );

      // Sub-header row
      rows.push(
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
        })
      );

      
      return rows;
    }


    // mostly used reusable snippets 
    // for images
    async function createImage(imagePath: string, width: number, height: number): Promise<Paragraph> {
      // Fetch the image and convert Blob to ArrayBuffer
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer(); // Convert Blob to ArrayBuffer
      const uint8Array = new Uint8Array(arrayBuffer); // Convert ArrayBuffer to Uint8Array

      return new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: uint8Array, // Binary data for the image
            transformation: {
              width,
              height,
            },
            type: "png",
          }),
        ],
      });
    }

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
        fontSize = 8,
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
                color,
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
    const totalColumns = quoteData.quotes[0].data.length + 1
    const columnWidth = 100 / totalColumns


    // title of each table 
    const tableTitle = (titleText: string, size: number = 24, color: string = '#AC0233') =>
      new Paragraph({
        children: [
          new TextRun({
            text: titleText,
            size,
            bold: true,
            color
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
            color: color
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
            color
          }),
        ],
        spacing: { before, after },
        alignment, // Apply the alignment dynamically
      });
    }
    //****************************************************************** */
    // Create header content
    const createHeader = () => {
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


    // async function createFooter(imagePath: string): Promise<Footer> {
    //   // Fetch the image using createImage function
    //   const footerImage = await createImageFromBase64(imagePath, 220, 120);

    //   return new Footer({
    //     children: [
    //       new Paragraph({
    //         children: [
    //           new TextRun({
    //             text: '*This is a system-generated quote that does not require a signature\nThe Mediterranean & Gulf Insurance & Reinsurance Co. B.S.C\nC.R. No: 1204528 - Insurance Authority No. 91',
    //             size: 14,
    //             color: '#ababab',
    //           }),
    //         ],
    //         alignment: AlignmentType.CENTER,  // Center the text horizontally
    //         frame: {
    //           type: "absolute",  // Absolute positioning
    //           anchor: {
    //             horizontal: "page",  // Align horizontally to the page
    //             vertical: "page",    // Align vertically to the page
    //           },
    //           position: { x: 3000, y: 1500 },  // Adjust y value to move to bottom (fine-tune as needed)
    //           width: 4500,  // Adjust width for text
    //           height: 800,  // Adjust height for the paragraph
    //         },
    //       }),

    //       new Paragraph({
    //         children: [footerImage],
    //         alignment: AlignmentType.CENTER,  // Center the text horizontally
    //         frame: {
    //           type: "absolute",  // Absolute positioning
    //           anchor: {
    //             horizontal: "page",  // Align horizontally to the page
    //             vertical: "page",    // Align vertically to the page
    //           },
    //           position: { x: 8000, y: 15000 },  // Adjust y value to move to bottom (fine-tune as needed)
    //           width: 4500,  // Adjust width for text
    //           height: 800,  // Adjust height for the paragraph
    //         },
    //       }),
    //     ],
    //   });
    // }

    // const footer = await createFooter(pdfImages.footerImg);


    // Custome footer for other pages
    function customFooter(text1: string, text2: string, text3: string, size: number, color: string): Footer {
      return new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: text1,
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

              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: text3,
                size, color,
              }),
            ],
          }),
        ],
      });
    }
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
          CommonCell('Basic Details', { color: "#00587C", fontSize: 9, bold: true, width: { size: 35, type: "pct" }, alignment: AlignmentType.LEFT }),
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

    let categoryData = this.categoriesWithDetails(quoteData.allCensusData, quoteData.quotes[0].data, 'category');

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
              CommonCell(`${(quote.quote_type[0].toUpperCase()) + ((quote.quote_type).slice(1))} Quote & ${(quote.risk_type).toUpperCase()}`, { fontSize: 11, bold: true, color: "#AC0233", width: { size: 34, type: "pct" } }), // Second column
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

    const summaryTable = createSummaryTable(quoteData.quotes[0]);

    //****************************************************************** */
    // category and Premium table 

    const createRow3 = (tobHeader: string, values: string[]): TableRow =>
      new TableRow({
        children: [
          CommonCell(tobHeader, { fontSize: 9, bold: false, width: { size: columnWidth, type: "pct" } }), // First column for "Tob Header"
          ...values.map(value => CommonCell(value, { fontSize: 9, bold: false, width: { size: columnWidth, type: "pct" } })), // Other columns for categories
        ],
      });

    const createPremiumTableRows = (data: Category[]): TableRow[] => {
      console.log("premium table", columnWidth);
      // Extract the tob_headers (unique keys in each category)
      const tobHeaders = data[0].premium_details.map((item: PremiumDetail) => item.tob_header);

      // First row is the header row (Tob Header and categories)
      const headerRow = new TableRow({
        children: [
          CommonCell('Premium', { fontSize: 9, color: "#AC0233", bold: true, width: { size: columnWidth, type: "pct" } }), // First column for "Tob Header"
          ...data.map(category => CommonCell(category.category_name, { fontSize: 9, color: "#AC0233", bold: true, width: { size: columnWidth, type: "pct" } })), // Columns for categories
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

    const premiumTableRows = createPremiumTableRows(this.extractedData);

    //****************************************************************** */
    // Category and Benifits table

    const createBenefitsTable = (organizedData: any) => {
      console.log("benifits table", columnWidth);
      if (Object.keys(organizedData).length === 0) {
        return [];
      }

      const tables: any[] = [];

      // Create the header row for categories only once, before the group detail rows
      const headerRow = new TableRow({
        children: [
          CommonCell("Benefits", {
            fontSize: 9,
            color: "#AC0233",
            bold: true,
            width: { size: columnWidth, type: "pct" },
          }),

          ...Array.from(new Set(Object.values(organizedData).flatMap((benefitsForGroup: any) => benefitsForGroup.map((benefit: any) => benefit.category_name))))
            .map((categoryName) =>
              CommonCell(categoryName, {
                fontSize: 9,
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
              fontSize: 9,
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
                fontSize: 9,
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

    const mandatoryBenefitsData = this.benefitsTableData(quoteData.quotes[0].data, 'mandatory_benefits');
    const optionalBenefitsData = this.benefitsTableData(quoteData.quotes[0].data, 'optional_benefits');
    const mandatoryBenefitsTable = createBenefitsTable(mandatoryBenefitsData);
    const optionalBenefitsTable = createBenefitsTable(optionalBenefitsData);

    //****************************************************************** */

    const ageBandAndMafInfo = this.ageBandAndMafData(quoteData.quotes[0].data);

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

            CommonCell("S.No", { fontSize: 9, bold: true, width: { size: 8, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
            CommonCell("Employee Id", { fontSize: 9, bold: true, width: { size: 14, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
            CommonCell("Employee Name", { fontSize: 9, bold: true, width: { size: 28, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
            CommonCell("Relations", { fontSize: 9, bold: true, width: { size: 14, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
            CommonCell("Age", { fontSize: 9, bold: true, width: { size: 8, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
            CommonCell("Category", { fontSize: 9, bold: true, width: { size: 14, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
            CommonCell("Member Type", { fontSize: 9, bold: true, width: { size: 14, type: "pct" }, fillColor: '#32CD32', alignment: AlignmentType.CENTER }),
          ],
        })
      );

      // Add Census Data Rows
      category.census.forEach((census: any, index: number) => {
        rows.push(
          new TableRow({
            children: [
              CommonCell((index + 1).toString(), { fontSize: 9, bold: false, width: { size: 8, type: "pct" }, alignment: AlignmentType.CENTER }),
              CommonCell(String(census.employee_id), { fontSize: 9, bold: false, width: { size: 14, type: "pct" }, alignment: AlignmentType.CENTER }),
              CommonCell(census.employee_name, { fontSize: 9, bold: false, width: { size: 28, type: "pct" }, alignment: AlignmentType.CENTER }),
              CommonCell(census.relations, { fontSize: 9, bold: false, width: { size: 14, type: "pct" }, alignment: AlignmentType.CENTER }),
              CommonCell(census.age.toString(), { fontSize: 9, bold: false, width: { size: 8, type: "pct" }, alignment: AlignmentType.CENTER }),
              CommonCell(census.category, { fontSize: 9, bold: false, width: { size: 14, type: "pct" }, alignment: AlignmentType.CENTER }),
              CommonCell(census.member_type, { fontSize: 9, bold: false, width: { size: 14, type: "pct" }, alignment: AlignmentType.CENTER }),
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

    const ageBandTables = ageBandAndMafInfo.map((category, index) => {
      const content = [];

      // Check if MAF data is available for the category
      if (category.census && category.census.length > 0) {
        const mafTable = mafRiskTable(category);
        content.push(...mafTable);
      }

      let ageBandTable

      if (category.emirate.trim().toLowerCase() === "dubai" && category.tpa.trim().toLowerCase() === "nextcare") {
        ageBandTable = AgeBandTable2(category)
      } else if (category.emirate.trim().toLowerCase() === "abu dhabi" && category.tpa.trim().toLowerCase() === "nextcare") {
        ageBandTable = AgeBandTable3(category)
      } else {
        ageBandTable = AgeBandTable1(category);
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

      const title = pageTitle(`Age Band - ${category.category_name}`, 24, '#AC0233');

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
      const title = tableTitle(`${titleText} - ${categoryName}`, 24, "#AC0233");

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
            CommonCell(row.Employee[`male${type}`].toString(), { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(row.Employee[`female${type}`].toString(), { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(row.Dependents[`male${type}`].toString(), { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(row.Dependents[`female${type}`].toString(), { fontSize: 8, alignment: AlignmentType.CENTER }),
            CommonCell(row[`maternity${type}`].toString(), { fontSize: 8, alignment: AlignmentType.CENTER }),
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
      console.log("ageband 2", category);
      console.log(category.pdfAgeBandDetailsUnify);
      let details = category?.pdfAgeBandDetailsUnify;
      const pageBreak = new Paragraph({
        children: [],
        pageBreakBefore: true,
      });

      const title = pageTitle(`Age Band - ${category.category_name}`, 24, '#AC0233');

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
            CommonCell(row.members_gross_premium, { fontSize: 8, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
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
      console.log("ageband 3", category.pdfAgeBandDetailsUnify);
      let details = category.pdfAgeBandDetailsUnify;
      const pageBreak = new Paragraph({
        children: [],
        pageBreakBefore: true,
      });

      const title = pageTitle(`Age Band - ${category.category_name}`, 24, '#AC0233');

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

    //****************************************************************** */

    // Terms and Conditions Page 
    const termsConditions = termsAndConditions.map((item, index) =>
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. ${item.text}`,
            size: 18
          }),
        ],
        spacing: { before: 50 },
        indent: { left: 360 },// Indents list items based on hierarchy level
      })
    );
    //****************************************************************** */

    // Exclusion section 
    let createExclusionsSection = (data: EmirateData[]): Paragraph[] => {
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
        paragraphs.push(pageTitle("General Exclusions", 57, "00587C"));

        // Add Exclusions for each Emirate
        emirateData.exclusions.forEach((exclusion: Exclusion) => {
          // Add Heading for Exclusion
          let bold = exclusion.title === "title";
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({ text: exclusion.heading, bold: bold, size: 18 }),
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
                    new TextRun({ text: `• ${bulletPoint}`, size: 16 }),
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

    let exclusionData =this.formatExclusionData(quoteData?.exclusion)
    let exclusion = createExclusionsSection(exclusionData)


    //****************************************************************** */
    // Acceptance and responsiblitites
    const acceptance = acceptanceAndAcknowledgment.map(
      (item, index) =>
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${item.text}`,
              size: 18
            }),
          ],
          spacing: { before: 50 },
          indent: { left: 360 }
        })
    );

    const nameAndSign = NameAndSignature.map(
      (item, index) =>
        new Paragraph({
          children: [
            new TextRun({
              text: `${item.text}`,
              size: 18
            }),
          ],
          spacing: { before: 100 },
        })
    );
    //****************************************************************** */
    // Policy Issuance Requirements

    // Function to create the unordered list with optional nested items
    function policyInsuranceRequirementList(ul: Array<{ text: string; ul?: Array<{ text: string }> }>) {
      const listItems = ul.map(item => {
        const paragraph = new Paragraph({
          children: [
            new TextRun({
              text: `• ${item.text}`,
              size: 18
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
                  size: 18
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

    const policyInsuranceRequirements1 = policyInsuranceRequirementList(policyInsuranceRequirement1);
    const policyInsuranceRequirements2 = policyInsuranceRequirementList(policyInsuranceRequirement2);


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
            default: createHeader(),
          },
          footers: {
            default: customFooter("Confdential, unpublished property of MEDGULF.Do not duplicate or distribute.", "Use and distribution is limited solely to authorized personnel.", "", 13, "#ababab"),
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
            default: createHeader(),
          },
          footers: {
            default: footer
          }
        },
        // 4th page
        {
          children: [
            summaryTable,
            tableTitle("Categories & Premium", 24, '#AC0233'),
            new Table({
              rows: premiumTableRows,
              layout: TableLayoutType.FIXED,
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
            }),
            tableTitle("Categories & Benefits", 24, '#AC0233'),
            ...mandatoryBenefitsTable,
            ...optionalBenefitsTable
          ]
        },
        {
          children: ageBandTables.flat(),
        },
        {
          children: [
            pageTitle("Terms and Conditions", 57, "00587C"),
            ...termsConditions
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
              ...acceptance,
              spaceParagraph,
              ...nameAndSign,
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
            default: createHeader(),
          },

          footers: {
            default: customFooter("Dubai Wharf Mall 1st Floor, Ofce DWR 22&23 Al Jaddaf Waterfront P.O. Box 30476, Dubai, UAE", "", "", 18, "#00587C"),
          },
        },
        {
          children: [
            new Table({
              rows: buildTableRows(),
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
          ],
        },
        {
          children: [
            new Table({
              rows: buildTableRows2(),
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
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
      saveAs(blob, `${CRN}.docx`);
      console.log('Word document created!');
    });
  }
}
