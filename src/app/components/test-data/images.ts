import {Component} from '@angular/core';
import {AlignmentType,Document,Packer,Paragraph,SectionType,Table,TableCell,TableRow,TextRun,WidthType} from 'docx';
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-test-data',
  templateUrl: './test-data.component.html',
  styleUrls: ['./test-data.component.css']
})
export class TestDataComponent {
  data = [
    {'BENEFITS GROUP': 'General','BENEFITS HEADERS': 'Regulatory Compliance','CATEGORY A': 'DHA','CATEGORY B': 'DHA','CATEGORY C': 'DHA'},

    {'BENEFITS GROUP': 'Policy Details','BENEFITS HEADERS': 'TPA','CATEGORY A': 'NAS'},

    {'BENEFITS GROUP': 'Inpatient Treatment','BENEFITS HEADERS': 'Referral Procedure','CATEGORY A': 'Not Applicable','CATEGORY B': 'Applicable','CATEGORY C': 'Applicable'},

    {'BENEFITS GROUP': 'Inpatient Treatment','BENEFITS HEADERS': 'Referral Procedure----','CATEGORY A': 'Not Applicable','CATEGORY D': 'hello'},

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
  generateDoc() {
    const categoryKeys = this.getUniqueCategories();

    const groupedTables: Record<string,any[]> = {};
    for (const row of this.data) {
      console.log(row);
      const group = row['BENEFITS GROUP'];
      if (!groupedTables[group]) {
        groupedTables[group] = [];
      }
      groupedTables[group].push(row);
    }

    console.log(groupedTables);

    const sections = Object.entries(groupedTables).map(([title,rows]) => {
      console.log(title,rows);
      return {
        properties: {type: SectionType.CONTINUOUS},
        children: [
          new Paragraph({
            text: title,
            heading: 'Heading1',
            spacing: {after: 200},
          }),
          this.createTable(title,rows),
        ],
      }
    });



    const doc = new Document({

      sections,
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob,'GroupedTables.docx');
    });
  }

  createTable(title: string,data: {'BENEFITS HEADERS': string; 'CATEGORY A': string}[]): Table {
    console.log("data",data);

    const headers: Array<'BENEFITS HEADERS' | 'CATEGORY A'> = ['BENEFITS HEADERS','CATEGORY A'];

    const defaultBorders = {
      top: {size: 10,color: '000000',space: 0,style: 'single' as const},
      bottom: {size: 10,color: '000000',space: 0,style: 'single' as const},
      left: {size: 10,color: '000000',space: 0,style: 'single' as const},
      right: {size: 10,color: '000000',space: 0,style: 'single' as const},
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
          shading: {fill: '1F9557'},

          borders: defaultBorders,
        }),
      ],
    });

    // Data Rows: Create a table row for each data entry
    const dataRows = data.map((row) => {
      console.log("row",row);
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
            width: {size: 50,type: WidthType.PERCENTAGE},
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
      rows: [titleRow,...dataRows],
    });
  }
}
