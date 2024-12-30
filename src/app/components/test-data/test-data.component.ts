import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { saveAs } from "file-saver";

import { AlignmentType, Document, ImageRun, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, Header, Footer, SimpleField, BorderStyle, VerticalAlign, SectionType, PageBreak } from 'docx';

import { quoteData, basicTableData, termsAndConditions, acceptanceAndAcknowledgment, NameAndSignature, policyInsuranceRequirement1, policyInsuranceRequirement2 } from './data';
import { pdfImages } from './images';

import { PremiumDetail, Category, CensusCategory, Exclusion, EmirateData, PdfAgeBandDetail, agebandData } from './interfaces'



@Component({
  selector: 'app-test-data',
  templateUrl: './test-data.component.html',
  styleUrls: ['./test-data.component.css']
})


export class TestDataComponent {


  constructor(private http: HttpClient) { }

  totalCategoryCount: number = 0




  ageBandAndMafData(data: any[]): agebandData[] {
    return data.map(item => {
      return {
        category_name: item.category_name,
        pdfAgeBandDetails: item.pdfAgeBandDetails || [],
        census: item.census,
      }
    });
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

  extractPremiumData = (quoteData: any[]) => {
    return quoteData.map((category: any) => ({
      category_name: category.category_name,
      premium_details: category.data?.premium_details || category.premium_details || [],
    }));
  };
  extractedData = this.extractPremiumData(quoteData.quotes[0].data);


  benefitsData = (data: any, benifitName: string) => {
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


  exclusionData = this.formatExclusionData(quoteData.exclusion)


  // ageBandAndMafInfo(data: CensusCategory[]) {
  //   return data
  //     .filter((category) => category.census.length > 0) // Include only categories with at least one census item
  //     .map((category) => ({
  //       category: category.category_name,
  //       census: category.census, // Include the entire census array
  //     }));
  // }


  async generateDocument() {

    //****************************************************************** */



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
    function pageTitle(title: string, size: number = 57) {
      return new Paragraph({
        children: [
          new TextRun({
            text: title,
            bold: true,
            color: "#00587C",
            size

          }),
        ],
        heading: "Heading1", // Sets this paragraph as a heading
        spacing: {
          after: 200, // Space after the heading
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

      ctx.fillStyle = "#00587C"; // Green color
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Convert canvas to base64
      const base64Image = canvas.toDataURL("image/png");

      // Decode base64 to binary data
      const base64Data = base64Image.split(",")[1]; // Remove the "data:image/png;base64," prefix
      const binaryString = atob(base64Data); // Decode base64 string
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
      const footerImage = await createImageFromBase64(imagePath, 220, 120); // Adjust size as needed

      // Create the footer
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
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
          }),
        ],
      });
    }

    const footer = await createFooter(pdfImages.footerImg);

    // other footer 
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
    // cell for each table 
    const tableCell = (text: any, isBold = false, size = 12, color = '#000000', width: number, bgColor: string = '#FFFFFF', alignment: any = AlignmentType.LEFT): TableCell => {
      return new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: String(text), // Ensure the text is a string
                bold: isBold, // Apply bold text if specified
                size, // Font size in half-points
                color,
              }),
            ],
            alignment,
            shading: {
              fill: bgColor, // Background color (Yellow) in HEX
            },
          }),
        ],
        width: { size: NaN ? 16 : Number(width), type: WidthType.PERCENTAGE }, // Width in percentage
        borders: defaultBorders(10, 'single'), // Default borders
        margins: { left: 20, top: 5, right: 10, bottom: 10 }, // Default margins
      });
    };
    //****************************************************************** */
    // Basic Table
    const createRow1 = (label: string, value: string | undefined) =>
      new TableRow({
        children: [
          tableCell(label, false, 18, '#000000', 35),
          tableCell(value || '', false, 18, '#000000', 35),
        ],
      });

    const basicTableRows = basicTableData.map(({ label, value }) => createRow1(label, value));
    //****************************************************************** */
    // category member table 

    const createRow2 = (categoryName: string, members: number, option: string) =>
      new TableRow({
        children: [
          tableCell(categoryName, false, 18, '#000000', 33),
          tableCell(members, false, 18, '#000000', 33),
          tableCell(option, false, 18, '#000000', 34),
        ],
      });


    let categoryData = this.categoriesWithDetails(quoteData.allCensusData, quoteData.quotes[0].data, 'category')

    const categoryMemberTableRows = categoryData
      .sort((a, b) => {
        // Compare category names in alphabetical order
        if (a.categoryName < b.categoryName) return -1;
        if (a.categoryName > b.categoryName) return 1;
        return 0;
      })
      .map(({ categoryName, members, option }) => createRow2(categoryName, members, option));

    //****************************************************************** */
    // quote summary row 

    function createSummaryTable(quote: any): Table {
      return new Table({
        rows: [
          new TableRow({
            children: [
              tableCell("Quote 1", true, 24, '#AC0233', 33), // First column
              tableCell(`${quote.quote_type} & ${quote.risk_type}`, true, 24, '#AC0233', 33), // Second column
              tableCell(`${quote.currency} ${quote.option_premium}`, true, 24, '#AC0233', 33), // Third column
            ],
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
      });
    }

    const summaryTable = createSummaryTable(quoteData.quotes[0]);

    //****************************************************************** */
    // category and Premium table 

    const createRow3 = (tobHeader: string, values: string[]): TableRow =>
      new TableRow({
        children: [
          tableCell(tobHeader, false, 18, '#000000', columnWidth), // First column for "Tob Header"
          ...values.map(value => tableCell(value, false, 18, '#000000', columnWidth)), // Other columns for categories
        ],
      });

    const createPremiumTableRows = (data: Category[]): TableRow[] => {
      // Extract the tob_headers (unique keys in each category)
      const tobHeaders = data[0].premium_details.map((item: PremiumDetail) => item.tob_header);

      // First row is the header row (Tob Header and categories)
      const headerRow = new TableRow({
        children: [
          tableCell('Premium', true, 18, '#AC0233', columnWidth), // First column for "Tob Header"
          ...data.map(category => tableCell(category.category_name, true, 18, '#AC0233', columnWidth)), // Columns for categories
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



    const createBenefitsTable = (organizedData: any) => {
      if (Object.keys(organizedData).length === 0) {
        return [];
      }


      const tables: any[] = [];

      // Create the header row for categories only once, before the group detail rows
      const headerRow = new TableRow({
        children: [
          tableCell("Benefits", true, 18, '#AC0233', columnWidth),

          ...Array.from(new Set(Object.values(organizedData).flatMap((benefitsForGroup: any) => benefitsForGroup.map((benefit: any) => benefit.category_name))))
            .map((categoryName) =>
              tableCell(String(categoryName), true, 18, '#AC0233', columnWidth)
            ),
        ],
      });

      // Add headerRow once to the table
      tables.push(new Table({
        rows: [headerRow],
        width: { size: 100, type: WidthType.PERCENTAGE },
      }));

      // Loop through each group detail (e.g., "Policy Details")
      Object.keys(organizedData).forEach((groupDetail) => {
        const benefitsForGroup = organizedData[groupDetail];

        // Create group detail row with the group title, this will span all columns
        const groupDetailRow = new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: groupDetail, bold: true, size: 18, color: '#AC0233' })] })],
              columnSpan: 100 / totalColumns, // This cell will span across all columns
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: defaultBorders(10, 'single')
            }),
            // tableCell(groupDetail,true,16,'#000000', 100)

          ],
        });

        // Create rows for each benefit
        const benefitRows: any[] = [];
        const benefitNames = Array.from(new Set(benefitsForGroup.map((benefit: any) => benefit.tob_header)));

        benefitNames.forEach((tob_header) => {
          const row = new TableRow({
            children: [
              tableCell(String(tob_header), false, 18, '#000000', columnWidth),
              ...Array.from(new Set(benefitsForGroup.map((benefit: any) => benefit.category_name))).map((categoryName) => {
                // Find the benefit for the current category and benefit name
                const benefit = benefitsForGroup.find(
                  (b: any) => b.tob_header === tob_header && b.category_name === categoryName
                );
                return tableCell(benefit && benefit.tob_value ? benefit.tob_value : "N/A", false, 18, '#000000', columnWidth);
              }),
            ],
          });
          benefitRows.push(row);
        });

        // Add group detail row and its benefit rows
        tables.push(
          new Table({
            rows: [groupDetailRow, ...benefitRows],
            width: { size: 100, type: WidthType.PERCENTAGE },
          })
        );
      });

      return tables;
    };

    const mandatoryBenefitsData = this.benefitsData(quoteData.quotes[0].data, 'mandatory_benefits');
    const optionalBenefitsData = this.benefitsData(quoteData.quotes[0].data, 'optional_benefits');
    const mandatoryBenefitsTable = createBenefitsTable(mandatoryBenefitsData);
    const optionalBenefitsTable = createBenefitsTable(optionalBenefitsData);

    //****************************************************************** */

    const ageBandAndMafInfo = this.ageBandAndMafData(quoteData.quotes[0].data);


    function mafRiskTable(category: any): any[] {
      const tablesWithTitles: any[] = [];

      const rows: TableRow[] = [];

      // Add Table Header
      rows.push(
        new TableRow({
          children: [
            tableCell("S.No", true, 18, '#000000', 8, '#32CD32', AlignmentType.CENTER),
            tableCell("Employee Id", true, 18, '#000000', 14, '#32CD32', AlignmentType.CENTER),
            tableCell("Employee Name", true, 18, '#000000', 28, '#32CD32', AlignmentType.CENTER),
            tableCell("Relations", true, 18, '#000000', 14, '#32CD32', AlignmentType.CENTER),
            tableCell("Age", true, 18, '#000000', 8, '#32CD32', AlignmentType.CENTER),
            tableCell("Category", true, 18, '#000000', 14, '#32CD32', AlignmentType.CENTER),
            tableCell("Member Type", true, 18, '#000000', 14, '#32CD32', AlignmentType.CENTER),
          ],
        })
      );

      // Add Census Data Rows
      category.census.forEach((census: any, index: number) => {
        rows.push(
          new TableRow({
            children: [
              tableCell((index + 1).toString(), false, 18, '#000000', 8, '#FFFFFF', AlignmentType.CENTER), // S.No
              tableCell(census.employee_id, false, 18, '#000000', 14, '#FFFFFF', AlignmentType.CENTER), // Employee Id
              tableCell(census.employee_name, false, 18, '#000000', 28, '#FFFFFF', AlignmentType.CENTER), // Employee Name
              tableCell(census.relations, false, 18, '#000000', 14, '#FFFFFF', AlignmentType.CENTER), // Relations
              tableCell(census.age.toString(), false, 18, '#000000', 8, '#FFFFFF', AlignmentType.CENTER), // Age
              tableCell(census.category, false, 18, '#000000', 14, '#FFFFFF', AlignmentType.CENTER), // Category
              tableCell(census.member_type, false, 18, '#000000', 14, '#FFFFFF', AlignmentType.CENTER), // Member Type
            ],
          })
        );
      });


      let title = tableTitle(`MAF Required Members - ${category.category_name}`, 24, '#AC0233')

      // Create Table
      const table = new Table({
        rows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      });

      tablesWithTitles.push(title, table);
      // });

      return tablesWithTitles;
    }


    //****************************************************************** */

    // Define the CellOptions interface
    type AlignmentTypeEnum = typeof AlignmentType[keyof typeof AlignmentType];
    interface CellOptions {
      bold?: boolean;
      fontSize?: number;
      fillColor?: string;
      color?: string;
      alignment?: AlignmentTypeEnum;  // Correctly specify alignment as part of the enum
      rowSpan?: number;
      colSpan?: number;
    }

    // Create a styled cell
    function createStyledCell(text: string, options: CellOptions = {}) {
      const {
        bold = false,
        fontSize = 8,
        fillColor = "#FFFFFF",
        color = "#000000",
        alignment = AlignmentType.CENTER, // Use enum value directly
        rowSpan,
        colSpan,
      } = options;

      return new TableCell({
        rowSpan,
        columnSpan: colSpan,
        shading: {
          fill: fillColor,
        },
        children: [
          new Paragraph({
            alignment,  // Use enum value directly
            children: [
              new TextRun({
                text,
                bold,
                size: fontSize * 2, // `docx` uses half-points for font size
                color,
              }),
            ],
          }),
        ],
      });
    }

    // Function to create table for member count, gross premium, and total gross premium
    function createTableForCategory(category: any) {

      let title =  tableTitle(`Age Band - ${category.category_name}`, 24, '#AC0233')
      const tableRows = [
        new TableRow({
          children: [
            createStyledCell("Age band", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, rowSpan: 3 }),
            createStyledCell("Member Count", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, colSpan: 5 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell("Employees", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 2 }),
            createStyledCell("Dependents", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 2 }),
            createStyledCell("Maternity", { fillColor: "#E7E5EF", bold: true, fontSize: 8, rowSpan: 2 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell("Male", { fillColor: "#E7E5EF", fontSize: 8 }),
            createStyledCell("Female", { fillColor: "#E7E5EF", fontSize: 8 }),
            createStyledCell("Male", { fillColor: "#E7E5EF", fontSize: 8 }),
            createStyledCell("Female", { fillColor: "#E7E5EF", fontSize: 8 }),
          ],
        }),
      ];



      // Loop through the age band details for the current category
      category.pdfAgeBandDetails.forEach((row: any) => {
        tableRows.push(
          new TableRow({
            children: [
              createStyledCell(row.age, { fontSize: 8 }),
              createStyledCell(row.Employee.maleCount.toString(), { fontSize: 8 }),
              createStyledCell(row.Employee.femaleCount.toString(), { fontSize: 8 }),
              createStyledCell(row.Dependents.maleCount.toString(), { fontSize: 8 }),
              createStyledCell(row.Dependents.femaleCount.toString(), { fontSize: 8 }),
              createStyledCell(row.maternityCount.toString(), { fontSize: 8 }),
            ],
          })
        );
      });

      tableRows.push(
        new TableRow({
          children: [
            createStyledCell("", { colSpan: 6, fontSize: 8 }),
          ],
        })
      );



      // Create the table for Member Count
      const memberCountTable = new Table({
        rows: tableRows,
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

      // Table for Gross Premium (maleGrossPremium, femaleGrossPremium, maternityGrossPremium)
      const grossPremiumRows = [
        new TableRow({
          children: [
            createStyledCell("Age band", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, rowSpan: 3 }),
            createStyledCell("Gross Premium", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, colSpan: 5 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell("Employees", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 2 }),
            createStyledCell("Dependents", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 2 }),
            createStyledCell("Maternity", { fillColor: "#E7E5EF", bold: true, fontSize: 8, rowSpan: 2 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell("Male", { fillColor: "#E7E5EF", fontSize: 8 }),
            createStyledCell("Female", { fillColor: "#E7E5EF", fontSize: 8 }),
            createStyledCell("Male", { fillColor: "#E7E5EF", fontSize: 8 }),
            createStyledCell("Female", { fillColor: "#E7E5EF", fontSize: 8 }),
          ],
        }),
      ];

      category.pdfAgeBandDetails.forEach((row: any) => {
        grossPremiumRows.push(
          new TableRow({
            children: [
              createStyledCell(row.age, { fontSize: 8 }),
              createStyledCell(row.Employee.maleGrossPremium.toFixed(2), { fontSize: 8 }),
              createStyledCell(row.Employee.femaleGrossPremium.toFixed(2), { fontSize: 8 }),
              createStyledCell(row.Dependents.maleGrossPremium.toFixed(2), { fontSize: 8 }),
              createStyledCell(row.Dependents.femaleGrossPremium.toFixed(2), { fontSize: 8 }),
              createStyledCell(row.maternityGrossPremium.toFixed(2), { fontSize: 8 }),
            ],
          })
        );
      });

      grossPremiumRows.push(
        new TableRow({
          children: [
            createStyledCell("", { colSpan: 6, fontSize: 8 }), // 6 is the number of columns
          ],
        })
      );



      const grossPremiumTable = new Table({
        rows: grossPremiumRows,
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

      // Table for Total Gross Premium (maleTotalGrossPremium, femaleTotalGrossPremium, maternityTotalGrossPremium)
      const totalGrossPremiumRows = [
        new TableRow({
          children: [
            createStyledCell("Age band", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, rowSpan: 3 }),
            createStyledCell("Total Gross Premium", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, colSpan: 5 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell("Employees", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 2 }),
            createStyledCell("Dependents", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 2 }),
            createStyledCell("Maternity", { fillColor: "#E7E5EF", bold: true, fontSize: 8, rowSpan: 2 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell("Male", { fillColor: "#E7E5EF", fontSize: 8 }),
            createStyledCell("Female", { fillColor: "#E7E5EF", fontSize: 8 }),
            createStyledCell("Male", { fillColor: "#E7E5EF", fontSize: 8 }),
            createStyledCell("Female", { fillColor: "#E7E5EF", fontSize: 8 }),
          ],
        }),
      ];

      category.pdfAgeBandDetails.forEach((row: any) => {
        totalGrossPremiumRows.push(
          new TableRow({
            children: [
              createStyledCell(row.age, { fontSize: 8 }),
              createStyledCell(row.Employee.maleTotalGrossPremium.toFixed(2), { fontSize: 8 }),
              createStyledCell(row.Employee.femaleTotalGrossPremium.toFixed(2), { fontSize: 8 }),
              createStyledCell(row.Dependents.maleTotalGrossPremium.toFixed(2), { fontSize: 8 }),
              createStyledCell(row.Dependents.femaleTotalGrossPremium.toFixed(2), { fontSize: 8 }),
              createStyledCell(row.maternityTotalGrossPremium.toFixed(2), { fontSize: 8 }),
            ],
          })
        );
      });




      const totalGrossPremiumTable = new Table({
        rows: totalGrossPremiumRows,
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

      return [title,memberCountTable, grossPremiumTable, totalGrossPremiumTable];
    }

    const ageBandTables = ageBandAndMafInfo.map((category, index) => {

      // Create the tables for the category
      const table1 = createTableForCategory(category);
      const table2 = mafRiskTable(category);


      const content = [];

      // Add a page break before categories except the first one
      if (index > 0) {
        content.push(
          new Paragraph({
            pageBreakBefore: true
          })
        );
      }

      // Add the category name and the table1
      content.push(
        ...table2,
        ...table1
      );

      return content;
    });

    //****************************************************************** */

    function createTableForCategory2(category: any) {
      const tableRows = [
        new TableRow({
          children: [
            createStyledCell("Age bracket", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, rowSpan: 3 }),
            createStyledCell("Dubai", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, colSpan: 5 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell("Member Count", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 2 }),
            createStyledCell("Gross Premium per member", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 2 }),
            createStyledCell("Total Gross Premium", { fillColor: "#E7E5EF", bold: true, fontSize: 8 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell("Employees & Dependents", { fillColor: "#E7E5EF", fontSize: 8, bold: true, }),
            createStyledCell("Maternity Eligible", { fillColor: "#E7E5EF", fontSize: 8, bold: true, }),
            createStyledCell("Employees & Dependents excl. Maternity", { fillColor: "#E7E5EF", fontSize: 8, bold: true, }),
            createStyledCell("Maternity Premium Per Eligible Female", { fillColor: "#E7E5EF", fontSize: 8, bold: true, }),
            createStyledCell("Total", { fillColor: "#E7E5EF", fontSize: 8, bold: true }),
          ],
        }),
      ];

      // Create the table for Member Count
      const memberCountTable = new Table({
        rows: tableRows,
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


      return [memberCountTable];
    }



    const ageBandTables2 = ageBandAndMafInfo.map((category, index) => {
      // Create the tables for the category
      const tables = createTableForCategory2(category);

      const content = [];

      // Add a page break before categories except the first one
      if (index > 0) {
        content.push(
          new Paragraph({
            pageBreakBefore: true
          })
        );
      }

      // Add the category name and the tables
      content.push(
        tableTitle(`Age Band - ${category.category_name}`, 24, '#AC0233'),
        ...tables
      );

      return content;
    });



    function createTableForCategory3(category: any) {

      const tableRows2 = [
        new TableRow({
          children: [
            createStyledCell("Age bracket", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, rowSpan: 3 }),
            createStyledCell("Abhu Dhabi", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, colSpan: 10 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell("Member Count", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 3 }),
            createStyledCell("Gross Premium per member", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 3 }),
            createStyledCell("Total Gross Premium", { fillColor: "#E7E5EF", bold: true, fontSize: 8, colSpan: 4 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell("Employees", { fillColor: "#E7E5EF", fontSize: 8, bold: true }),
            createStyledCell("Dependents", { fillColor: "#E7E5EF", fontSize: 8, bold: true }),
            createStyledCell("Maternity", { fillColor: "#E7E5EF", fontSize: 8, bold: true }),
            createStyledCell("Employees", { fillColor: "#E7E5EF", fontSize: 8, bold: true }),
            createStyledCell("Dependents", { fillColor: "#E7E5EF", fontSize: 8, bold: true }),
            createStyledCell("Maternity", { fillColor: "#E7E5EF", fontSize: 8, bold: true }),
            createStyledCell("Employees", { fillColor: "#E7E5EF", fontSize: 8, bold: true }),
            createStyledCell("Dependents", { fillColor: "#E7E5EF", fontSize: 8, bold: true }),
            createStyledCell("Maternity", { fillColor: "#E7E5EF", fontSize: 8, bold: true }),
            createStyledCell("Total", { fillColor: "#E7E5EF", fontSize: 8, bold: true }),
          ],
        }),
      ];

      // Create the table for Member Count
      const memberCountTable2 = new Table({
        rows: tableRows2,
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

      return [memberCountTable2];
    }



    const ageBandTables3 = ageBandAndMafInfo.map((category, index) => {
      // Create the tables for the category
      const tables = createTableForCategory3(category);

      const content = [];

      // Add a page break before categories except the first one
      if (index > 0) {
        content.push(
          new Paragraph({
            pageBreakBefore: true
          })
        );
      }

      // Add the category name and the tables
      content.push(
        tableTitle(`Age Band - ${category.category_name}`, 24, '#AC0233'),
        ...tables
      );

      return content;
    });
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
        paragraphs.push(pageTitle("General Exclusions", 57));

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

    // Exclusion list
    let exclusion = createExclusionsSection(this.exclusionData)


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
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    tableCell('Basic Details', true, 24, '#00587C', 35),
                    tableCell("", false, 12, '#000000', 65)
                  ],
                }),
                ...basicTableRows,
              ],
            }),
            spaceParagraph,
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                // Header row with three columns: categoryName, members, and premium
                new TableRow({
                  children: [
                    tableCell('Categories', true, 18, '#AC0233', 33, '#E7E5EF'),
                    tableCell('Members', true, 18, '#AC0233', 33, '#E7E5EF'),
                    tableCell('Option 1', true, 18, '#AC0233', 34, '#E7E5EF')
                  ],
                }),
                // Dynamically created rows based on category data
                ...categoryMemberTableRows,
                new TableRow({
                  children: [
                    tableCell('Total', true, 18, '#000000', 33),
                    tableCell(String(this.totalCategoryCount), true, 18, '#000000', 33),
                    tableCell(`${quoteData.quotes[0].currency} ${quoteData.quotes[0].option_premium}`, true, 18, '000000', 34)
                  ],
                }),
              ],
            })
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
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: premiumTableRows
            }),
            tableTitle("Categories & Benifits", 24, '#AC0233'),
            ...mandatoryBenefitsTable,
            ...optionalBenefitsTable
          ]
        },
        // {
        //   children: [
        //     ...mafTables
        //   ],
        // },
        {
          children: ageBandTables.flat(),
        },
        {
          children: ageBandTables2.flat()
        },
        {
          children: ageBandTables3.flat()
        },
        {
          children: [
            pageTitle("Terms and Conditions", 57),
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
              pageTitle("Acceptance of Proposal & Acknowledgment of Responsibilities", 57),
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
              pageTitle("Policy Issuance Requirements", 57),
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
      saveAs(blob, 'output.docx');
      console.log('Word document created!');
    });
  }
}
