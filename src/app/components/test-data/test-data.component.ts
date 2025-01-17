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

export class TestDataComponent  implements OnInit {

  constructor(private http: HttpClient) {
   }
   public transformedResultResponse: any
   public totalColumns:any
   public columnWidth:any
   totalCategoryCount: number = 0
   public quoteGeneratedDate:any

   async ngOnInit(): Promise<void> {
    this.transformedResultResponse = quoteData
    this.quoteGeneratedDate =this.transformedResultResponse.companyDetails.quoteGeneratedDate
    this.totalColumns =
        this.transformedResultResponse.quotes[0].data.length + 1
      this.columnWidth = 100 / this.totalColumns
   }
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
 // Basic Table
 basicTable(quoteData:any) {
   let basicTableData =
     [
       {
         label: 'Client / Policy Holder Name', value:
           quoteData.companyDetails.company_name
       },
       {
         label: 'Scheme Start Date/Renewal Date', value:quoteData.censusDetails.policy_start_date
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

//  categoriesDetailTable(categoryData:any, quoteData:any) {
//    const categoryMemberTableRows = [
//      ...categoryData
//        .sort((a:any, b:any) => {
//          // Compare category names in alphabetical order
//          if (a.categoryName < b.categoryName) return -1;
//          if (a.categoryName > b.categoryName) return 1;
//          return 0;
//        })
//        .map(({ categoryName, members, option }) => this.createRow2(categoryName, members, option)),
//      // Add the "Total" row
//      new TableRow({
//        children: [
//          this.CommonCell('Total', { fontSize: 9, bold: true, width: { size: 33, type: "pct" } }),
//          this.CommonCell(String(this.totalCategoryCount), { fontSize: 9, bold: true, width: { size: 33, type: "pct" } }),
//          this.CommonCell(`${quoteData.quotes[0].currency} ${quoteData.quotes[0].option_premium}`, { fontSize: 9, bold: true, width: { size: 34, type: "pct" } }),
//        ],
//      }),
//    ];

//    return new Table({
//      rows: [
//        // Header row
//        new TableRow({
//          children: [
//            this.CommonCell('Categories', { color: "#AC0233", fillColor: "#d5d5d5", fontSize: 9, bold: true, width: { size: 33, type: "pct" } }),
//            this.CommonCell('Members', { color: "#AC0233", fillColor: "#d5d5d5", fontSize: 9, bold: true, width: { size: 33, type: "pct" } }),
//            this.CommonCell('Option 1', { color: "#AC0233", fillColor: "#d5d5d5", fontSize: 9, bold: true, width: { size: 34, type: "pct" } }),
//          ],
//        }),
//        // Dynamically created rows including the "Total" row
//        ...categoryMemberTableRows,
//      ],
//      layout: TableLayoutType.FIXED,
//      width: {
//        size: 100,
//        type: WidthType.PERCENTAGE,
//      },
//    });

//  }

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
           this.CommonCell(`${quote.currency} ${quote.option_premium}`, { fontSize: 11, bold: true, color: "#AC0233", width: { size: 33, type: "pct" } }), // Third column
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
         this.CommonCell("Age bracket", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, rowSpan: 3, width: { size: 16.67, type: "pct" }, alignment: AlignmentType.CENTER }),
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
         this.CommonCell("Age bracket", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, rowSpan: 3, width: { size: 9.09, type: "pct" }, alignment: AlignmentType.CENTER }),
         this.CommonCell("Abhu Dhabi", { fillColor: "#B7B5CF", color: "#365d7c", bold: true, fontSize: 8, colSpan: 10, width: { size: 9.09 * 10, type: "pct" }, alignment: AlignmentType.CENTER }),
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
 AgeBandTable4(category: any, premium:any, member:any) {
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
 AgeBandTable5(category:any, premium:any, member:any) {
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
 checkSingleFemalePremiumDisplay(arr:any) {
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
         color: "#AC0233",
         bold: true,
         width: { size: this.columnWidth, type: "pct" },
       }),

       ...Array.from(new Set(Object.values(organizedData).flatMap((benefitsForGroup: any) => benefitsForGroup.map((benefit: any) => benefit.category_name))))
         .map((categoryName) =>
           this.CommonCell(categoryName, {
             fontSize: 10,
             color: "#AC0233",
             bold: true,
             width: { size: this.columnWidth, type: "pct" }
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
           color: "#AC0233",
           width: { size: 100, type: "pct" },
           colSpan: 100 / this.columnWidth
         }),
       ],
     });

     // Create rows for each benefit
     const benefitRows: any[] = [];
     const benefitNames = Array.from(new Set(benefitsForGroup.map((benefit: any) => benefit.tob_header)));

     benefitNames.forEach((tob_header) => {
       const row = new TableRow({
         children: [
           this.CommonCell(String(tob_header), {
             fontSize: 10,
             bold: false,
             width: { size: this.columnWidth, type: "pct" },
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
 //****************************************************************** */

 // category and Premium table 
 createRow3 = (tobHeader: string, values: string[]): TableRow =>
   new TableRow({
     children: [
       this.CommonCell(tobHeader, { fontSize: 10, bold: false, width: { size: this.columnWidth, type: "pct" } }), // First column for "Tob Header"
       ...values.map(value => this.CommonCell(value, { fontSize: 9, bold: false, width: { size: this.columnWidth, type: "pct" } })), // Other columns for categories
     ],
   });

 createPremiumTableRows = (data: Category[], fontColor:any, bgColor:any): TableRow[] => {
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
   const dataRows = tobHeaders.map((tobHeader: string) => {
     console.log("tobHeader",tobHeader);
     const values = data.map(category => {
       console.log("Category",category);
       const premiumDetail = category.premium_details.find(
         (detail: PremiumDetail) => detail.tob_header === tobHeader
       );
       return premiumDetail ? premiumDetail.tob_value : ''; // Return tob_value if found, else empty string
     });
     return this.createRow3(tobHeader, values);
   });

   return [headerRow, ...dataRows];
 };

 async generateDocument(quoteData: any) {

   const footer = await this.commonFooter(pdfImages.footerImg);

   let basicDetailsTable = this.basicTable(quoteData)

   // category member table 
   let categoryData = this.categoriesWithDetails(quoteData.allCensusData, quoteData.quotes[0].data, 'category');
   let categoriesDetailsTable =this.categoriesDetailTable(categoryData, quoteData)
   //****************************************************************** */
   // quote summary row 
   const summaryTable = this.createSummaryTable(quoteData.quotes[0]);

   //****************************************************************** */
   // category and Premium table 
   let extractedData = this.PremiumTableData(quoteData.quotes[0].data);
   const premiumTableRows1 = this.createPremiumTableRows(extractedData, "#AC0233", "#FFFFFF");
   const premiumTableRows2 = this.createPremiumTableRows(extractedData, "#365d7c", "#B7B5CF");

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
       // 1st Page 
       {
         children: [await this.createImageFromBase64(pdfImages.homeImg, 595, 800)],
       },
       // 2nd page 
       {
         children: [await this.createImageFromBase64(pdfImages.homeImg1, 595, 750)],
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
           this.spaceParagraph,
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
           this.tableTitle("Categories & Premium", 26, '#AC0233'),
           new Table({
             rows: premiumTableRows1,
             layout: TableLayoutType.FIXED,
             width: {
               size: 100,
               type: WidthType.PERCENTAGE,
             },
           }),
           this.tableTitle("Categories & Benefits", 26, '#AC0233'),
           ...mandatoryBenefitsTable,
           ...optionalBenefitsTable
         ]
       },
       {
         children: [
           ...ageBandTables.flat(),
           this.tableTitle("Premium Summary", 26, '#AC0233'),
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
           this.pageTitle("Terms and Conditions", 57, "00587C"),
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
             this.pageTitle("Acceptance of Proposal & Acknowledgment of Responsibilities", 57, "#00587C"),
             this.textLine("I, the undersigned and duly authorized by my company hereby:", 18, 100, 100, AlignmentType.LEFT),
             ...this.acceptance,
             this.spaceParagraph,
             ...this.nameAndSign,
             this.textLine("Upon your confirmation, MEDGULF requires up to 5 working days from receipt of regulatory approvals along with all the below listed requirements:", 18, 100, 100, AlignmentType.LEFT)
           ],
       },
       {
         children:
           [
             this.pageTitle("Policy Issuance Requirements", 57, "00587C"),
             this.textLine("Upon your confirmation, MEDGULF requires up to 5 working days from receipt of regulatory approvals along with all the below listed requirements:", 18, 100, 100, AlignmentType.LEFT),
             ...policyInsuranceRequirements1,
             this.textLine("Should any assistance be needed, please do not hesitate to contact us via:", 18, 100, 100, AlignmentType.LEFT),
             ...policyInsuranceRequirements2
           ],
       },
       {
         children: [await this.createImageFromBase64(pdfImages.pdfFooterImg, 450, 220)],
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
     saveAs(blob, `${this.transformedResultResponse.companyDetails.client_reference_number}.docx`);
   });
 }

 async createDocument(){
  return await this.generateDocument(this.transformedResultResponse)
 }
}
