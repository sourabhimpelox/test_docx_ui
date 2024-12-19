import { Component } from '@angular/core';
import { AlignmentType, Document, Packer, Paragraph, SectionType, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-test-data',
  templateUrl: './test-data.component.html',
  styleUrls: ['./test-data.component.css']
})




export class TestDataComponent {
  data = [
    { 'BENEFITS GROUP': 'General', 'BENEFITS HEADERS': 'Regulatory Compliance', 'CATEGORY A': 'DHA', 'CATEGORY B': 'DHA', 'CATEGORY C': 'DHA' },

    { 'BENEFITS GROUP': 'Policy Details', 'BENEFITS HEADERS': 'TPA', 'CATEGORY A': 'NAS' },

    { 'BENEFITS GROUP': 'Inpatient Treatment', 'BENEFITS HEADERS': 'Referral Procedure', 'CATEGORY A': 'Not Applicable', 'CATEGORY B': 'Applicable', 'CATEGORY C': 'Applicable' },

    { 'BENEFITS GROUP': 'Inpatient Treatment', 'BENEFITS HEADERS': 'Referral Procedure----', 'CATEGORY A': 'Not Applicable', 'CATEGORY D': 'hello' },

  ];
  getUniqueCategories(): string[] {
    const categoryKeys = new Set<string>(); // Use a Set to store unique category keys

    this.data.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key.startsWith('CATEGORY')) {
          categoryKeys.add(key); // Add unique keys to the Set
        }
      });
    });

    return Array.from(categoryKeys); // Convert Set to an array
  }



  extractPremiumData = (data: any) => {
    // Initialize an array to store unique tob_headers
    const tobHeaders: any = [];

    // Initialize an object to map each tob_header to its category data
    const categoryDataMap: any = {};

    // Process each category in the input data
    data.forEach((category: any) => {
      // Determine where `premium_details` is located
      const premiumDetails: any = category.data?.premium_details || category.premium_details || [];

      premiumDetails.forEach((pd: any) => {
        // Add unique tob_header to the array
        if (!tobHeaders.includes(pd.tob_header)) {
          tobHeaders.push(pd.tob_header);
        }

        // Initialize category data for this tob_header if not already present
        if (!categoryDataMap[pd.tob_header]) {
          categoryDataMap[pd.tob_header] = [];
        }

        // Add the tob_value to the appropriate index based on the category
        const categoryIndex = data.findIndex((cat: any) => cat.category_name === category.category_name);
        categoryDataMap[pd.tob_header][categoryIndex] = pd.tob_value;
      });
    });

    // Prepare the final data structure
    const tableData = tobHeaders.map((header: any) => {
      const row = [header]; // Start with tob_header
      data.forEach((category: any, index: any) => {
        const value = categoryDataMap[header]?.[index];
        row.push(value || ''); // Add the value or an empty string
      });
      return row;
    });

    // Prepare headers with the first column as 'Tob Header' and subsequent columns as category names
    const headers = ['Tob Header', ...data.map((category: any) => category.category_name)];

    // Return structured data
    return {
      headers,
      rows: tableData,
    };
  };
  generateDoc() {


    const groupedTables: Record<string, any[]> = {};
    for (const row of this.data) {
      console.log(row);
      const group = row['BENEFITS GROUP'];
      if (!groupedTables[group]) {
        groupedTables[group] = [];
      }
      groupedTables[group].push(row);
    }

    console.log(groupedTables);

    const sections = Object.entries(groupedTables).map(([title, rows]) => {
      console.log(title, rows);
      return {
        properties: { type: SectionType.CONTINUOUS },
        children: [
          new Paragraph({
            text: title,
            heading: 'Heading1',
            spacing: { after: 200 },
          }),
          this.createTable(title, rows),
        ],
      }
    });



    const doc = new Document({

      sections,
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'GroupedTables.docx');
    });
  }

  createTable(title: string, data: { 'BENEFITS HEADERS': string; 'CATEGORY A': string }[]): Table {
    console.log("data", data);

    const headers: Array<'BENEFITS HEADERS' | 'CATEGORY A'> = ['BENEFITS HEADERS', 'CATEGORY A'];

    const defaultBorders = {
      top: { size: 10, color: '000000', space: 0, style: 'single' as const },
      bottom: { size: 10, color: '000000', space: 0, style: 'single' as const },
      left: { size: 10, color: '000000', space: 0, style: 'single' as const },
      right: { size: 10, color: '000000', space: 0, style: 'single' as const },
    };

    const titleRow = new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({
            children: [
              new TextRun({
                text: title,
                size: 25,
                color: 'FFFFFF',
                font: 'Roboto'
              }),
            ],
            indent: {
              start: 100,
            },
            // spacing: { before: 50, after: 50 },
            alignment: AlignmentType.CENTER,
          })],
          columnSpan: 2,
          shading: { fill: '1F9557' },

          borders: defaultBorders,
        }),
      ],
    });

    // Data Rows: Create a table row for each data entry
    const dataRows = data.map((row) => {
      console.log("row", row);
      return new TableRow({
        children: headers.map((key) =>
          new TableCell({
            children: [new Paragraph({
              children: [
                new TextRun({
                  text: row[key],
                  size: 23,
                  font: 'Roboto'
                }),
              ],
              indent: {
                start: 100,
              },
              // spacing: { before: 50, after: 50 }
            })],
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: defaultBorders,

          })
        ),
      })
    }
    );

    return new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: [titleRow, ...dataRows],
    });
  }
}


let quoteData = {
  "quotes": [
    {
      "data": [
        {
          "category_name": "Category A",
          "data": {
            "premium_details": [
              {
                "group_details": "Premium",
                "tob_header": "GWP",
                "tob_value": "AED 287,047.84"
              },
              {
                "group_details": "Premium",
                "tob_header": "Basmah Fee / ICP Fee",
                "tob_value": "AED 1184"
              },
              {
                "group_details": "Premium",
                "tob_header": "GWP With Basmah Fee / GWP With ICP Fee",
                "tob_value": "AED 288,231.84"
              },
              {
                "group_details": "Premium",
                "tob_header": "VAT",
                "tob_value": "AED 14,411.59"
              },
              {
                "group_details": "Premium",
                "tob_header": "Total Premium",
                "tob_value": "AED 302,643.41"
              }
            ]
          }
        },
        {
          "category_name": "Category B",
          "premium_details": [
            {
              "group_details": "Premium",
              "tob_header": "GWP",
              "tob_value": "AED 287,047.84"
            },
            {
              "group_details": "Premium",
              "tob_header": "Basmah Fee / ICP Fee",
              "tob_value": "AED 1184"
            },
            {
              "group_details": "Premium",
              "tob_header": "GWP With Basmah Fee / GWP With ICP Fee",
              "tob_value": "AED 288,231.84"
            },
            {
              "group_details": "Premium",
              "tob_header": "VAT",
              "tob_value": "AED 14,411.59"
            },
            {
              "group_details": "Premium",
              "tob_header": "Total Premium",
              "tob_value": "AED 302,643.41"
            }
          ]
        }
      ]
    }
  ]

}


let benifits = {
  "quotes": [
    {
      "data": [
        {
          "category_name": "Category A",
          "data": {
            "primary_benefits": [
              {
                "group_details": "Policy Details",
                "benefits_name": "Territorial Scope of Coverage",
                "benefits_options": "Worldwide ",
              }

            ]
          }
        },
        {
          "category_name": "Category B",
          "data": {
            "primary_benefits": [
              {
                "group_details": "Policy Details",
                "benefits_name": "Territorial Scope of Coverage",
                "benefits_options": "Worldwide ",
              }

            ]
          }
        },

      ]
    }
  ]
}