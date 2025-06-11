// import { Component } from '@angular/core';


// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent {
//   title = 'crud_app';
//   constructor() {}


// }


// import { Component } from '@angular/core';
// import { Document, Packer, Paragraph, LevelFormat, AlignmentType, convertInchesToTwip } from 'docx';
// import { saveAs } from 'file-saver';

// // Constants for numbering configurations
// const NUMBERING_CONFIG = {
//   dynamicNumbering: [
//     {
//       level: 0,
//       format: LevelFormat.DECIMAL,
//       text: '%1.',
//       alignment: AlignmentType.START,
//       style: {
//         paragraph: {
//           indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
//         },
//       },
//     },
//     {
//       level: 1,
//       format: LevelFormat.LOWER_LETTER,
//       text: '%2.',
//       alignment: AlignmentType.START,
//       style: {
//         paragraph: {
//           indent: { left: convertInchesToTwip(1), hanging: convertInchesToTwip(0.25) },
//         },
//       },
//     },
//   ],
//   dynamicBullets: [
//     {
//       level: 0,
//       format: LevelFormat.BULLET,
//       text: '\u2022',
//       alignment: AlignmentType.LEFT,
//       style: {
//         paragraph: {
//           indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
//         },
//       },
//     },
//     {
//       level: 1,
//       format: LevelFormat.BULLET,
//       text: '\u25E6',
//       alignment: AlignmentType.LEFT,
//       style: {
//         paragraph: {
//           indent: { left: convertInchesToTwip(1), hanging: convertInchesToTwip(0.25) },
//         },
//       },
//     },
//   ],
// };

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css'],
// })
// export class AppComponent {
//   // Dynamic list content
//   listContent = [
//     { type: 'number', level: 0, text: 'Numbered Item 1' },
//     { type: 'number', level: 1, text: 'Numbered Subitem 1.1' },
//     { type: 'bullet', level: 0, text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." },
//     { type: 'bullet', level: 1, text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." },
//   ];

//   // New item object
//   newItem = { type: 'number', level: 0, text: '' };

//   // Add new item to the list
//   addItem() {
//     if (this.newItem.text.trim()) {
//       this.listContent.push({ ...this.newItem });
//       this.newItem.text = '';
//     }
//   }

//   // Generate Word document
//   generateWordDoc() {
//     const doc = new Document({
//       numbering: {
//         config: [
//           { reference: 'dynamic-numbering', levels: NUMBERING_CONFIG.dynamicNumbering },
//           { reference: 'dynamic-bullets', levels: NUMBERING_CONFIG.dynamicBullets },
//         ],
//       },
//       sections: [
//         {
//           children: this.createParagraphs(),
//         },
//       ],
//     });

//     Packer.toBlob(doc).then((blob) => {
//       saveAs(blob, 'DynamicList.docx');
//     });
//   }

//   // Create paragraphs from listContent
//   private createParagraphs(): Paragraph[] {
//     return this.listContent.map((item) =>
//       new Paragraph({
//         text: item.text,
//         numbering:
//           item.type === 'number'
//             ? { reference: 'dynamic-numbering', level: item.level }
//             : { reference: 'dynamic-bullets', level: item.level },
//       })
//     );
//   }
// }

// import { Component } from '@angular/core';
// import { saveAs } from 'file-saver';
// import { Document, Packer, Paragraph, LevelFormat, AlignmentType, convertInchesToTwip } from 'docx';
// const NUMBERING_CONFIG = {
//   dynamicNumbering: [
//     {
//       level: 0,
//       format: LevelFormat.DECIMAL,
//       text: '%1.',
//       alignment: AlignmentType.START,
//       style: {
//         paragraph: {
//           indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
//         },
//       },
//     },
//     {
//       level: 1,
//       format: LevelFormat.LOWER_LETTER,
//       text: '%2.',
//       alignment: AlignmentType.START,
//       style: {
//         paragraph: {
//           indent: { left: convertInchesToTwip(1), hanging: convertInchesToTwip(0.25) },
//         },
//       },
//     },
//   ],
//   dynamicBullets: [
//     {
//       level: 0,
//       format: LevelFormat.BULLET,
//       text: '\u2022',
//       alignment: AlignmentType.LEFT,
//       style: {
//         paragraph: {
//           indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
//         },
//       },
//     },
//     {
//       level: 1,
//       format: LevelFormat.BULLET,
//       text: '\u25E6',
//       alignment: AlignmentType.LEFT,
//       style: {
//         paragraph: {
//           indent: { left: convertInchesToTwip(1), hanging: convertInchesToTwip(0.25) },
//         },
//       },
//     },
//   ],
// };

// export let listContent = [
//   { level: 0, type: 'number', text: "It is the duty of the Master policy holder and the Insured member, on behalf of self and their dependents, to inform insurance company about any existing illness or any diagnosis which would develop into major conditions. This is applicable for all types of enrolments including at inception of the policy as well as during midterm addition /Category changes. Failure to disclose such material facts will prejudice the insured's position from the Company's acceptance of any claims relating to such conditions." },
//   { level: 0, type: 'number', text: 'As per Dubai Health Authority (DHA) circular SN 04/2019, all member records need to be validated through Dubai Health Care Post Office (DHPO) eClaims link before issuing the policy. DHA will validate member details with General Directorate of Residency and Foreigners Affairs (GDRFA) Dubai records using Date of Birth, Nationality, Gender and Reference ID (Visa File number for expats, Passport number for diplomats and GCC Nationals, Emirates ID for UAE Nationals and Birth certificate for new born (born in UAE)). This change is applicable for all transactions processed after 1st October 2019.' },
//   { level: 0, type: 'number', text: 'Additions will be processed from reported date only. Backdating effective date is not allowed. (DHA circular Reference 5 of 2017 (GC 05/2017), All the late enrollment will require individual medical underwriting. All additions of members during the policy will have to declare all pre-existing conditions in relation to above listed conditions. Visa and passport copy is mandatory for all the additions. Member with known medical history to be notified during the addition stage, such member will be added subject to underwriting.' },
//   { level: 0, type: 'number', text: 'The policyholder must report one of the following dates for the Deletion of members as a deletion effective date, based on whichever occurs first - 30 days from visa cancellation date, exit date from UAE or visa transfer date. Backdated deletion is not allowed.' },
//   {
//     level: 0, type: 'number', text:
//       'For HAAD compliant policies: For the sake of “Continuity of Cover” New and Renewal confirmations can be backdated to the anniversary date if: \n ',
//     nestedList: [
//       { level: 0, type: 'bullet', text: 'a) The date of confirmation falls within the 30 days grace period provided by HAAD and \n' },
//       { level: 0, type: 'bullet', text: 'b) The policy start date does not fall before NLGIC initial quotation date.\n', },
//       { level: 0, type: 'bullet', text: 'c)  For all new business HAAD COC must specify last date of cover with the previous insurer.\n' }
//     ]
//   },
// ];

// interface ListItem {
//   type: string;
//   level: number;
//   text: string;
//   noBullet?: boolean;
//   nestedList?: ListItem[]; // Add nestedList property
// }


// export class AppComponent {
//   title = 'docx-header-image-app';

//   // New item object
//   newItem = { type: 'number', level: 0, text: '' };

//   // Add new item to the list
//   addItem() {
//     if (this.newItem.text.trim()) {
//       listContent.push({ ...this.newItem });
//       this.newItem.text = '';
//     }
//   }

//   // Generate Word document
//   generateWordDoc() {
//     const doc = new Document({
//       numbering: {
//         config: [
//           { reference: 'dynamic-numbering', levels: NUMBERING_CONFIG.dynamicNumbering },
//           { reference: 'dynamic-bullets', levels: NUMBERING_CONFIG.dynamicBullets },
//         ],
//       },
//       sections: [
//         {
//           children: this.createParagraphs(),
//         },
//       ],
//     });

//     Packer.toBlob(doc).then((blob) => {
//       saveAs(blob, 'DynamicListWithNestedItems.docx');
//     });
//   }

//   // Create paragraphs from listContent with support for nested items
//   private createParagraphs(): Paragraph[] {
//     return listContent.map((item) => {
//       if (item.nestedList && Array.isArray(item.nestedList)) {
//         // Handle nested list
//         const nestedParagraphs = item.nestedList.map((nestedItem) =>
//           new Paragraph({
//             text: nestedItem.text,
//             numbering: {
//               reference: 'dynamic-bullets',
//               level: nestedItem.level,
//             },
//             alignment: AlignmentType.LEFT,
//           })
//         );
//         // Add the parent item and then nested items
//         return [
//           new Paragraph({
//             text: item.text,
//             numbering: {
//               reference: 'dynamic-numbering',
//               level: item.level,
//             },
//             alignment: AlignmentType.LEFT,
//           }),
//           ...nestedParagraphs, // Add nested items
//         ];
//       } else {
//         // Handle regular item
//         return new Paragraph({
//           text: item.text,
//           numbering:
//             item.type === 'number'
//               ? { reference: 'dynamic-numbering', level: item.level }
//               : { reference: 'dynamic-bullets', level: item.level },
//           alignment: AlignmentType.LEFT,
//         });
//       }
//     }).flat(); // Flatten the nested array
//   }
// }
// export class AppComponent {
//   title = 'docx-header-image-app';

//   // Define the listContent here
//   listContent: ListItem[] = [
//     { type: 'number', level: 0, text: 'Numbered Item 1' },
//     { type: 'bullet', level: 0, text: 'Bullet Item 1' },
//     {
//       type: 'bullet',
//       level: 1,
//       text: 'Nested Bullet Item 1',
//       nestedList: [
//         { type: 'bullet', level: 2, text: 'Nested Bullet Subitem 1' },
//         { type: 'bullet', level: 2, text: 'Nested Bullet Subitem 2' }
//       ]
//     },
//     { type: 'bullet', level: 0, text: 'Bullet Item 2', noBullet: true },
//   ];

//   // New item object
//   newItem = { type: 'number', level: 0, text: '' };

//   // Add new item to the list
//   addItem() {
//     if (this.newItem.text.trim()) {
//       this.listContent.push({ ...this.newItem });
//       this.newItem.text = '';
//     }
//   }

//   // Generate Word document
//   generateWordDoc() {
//     const doc = new Document({
//       numbering: {
//         config: [
//           { reference: 'dynamic-numbering', levels: NUMBERING_CONFIG.dynamicNumbering },
//           { reference: 'dynamic-bullets', levels: NUMBERING_CONFIG.dynamicBullets },
//         ],
//       },
//       sections: [
//         {
//           children: this.createParagraphs(),
//         },
//       ],
//     });

//     Packer.toBlob(doc).then((blob) => {
//       saveAs(blob, 'DynamicListWithNestedItems.docx');
//     });
//   }

//   // Create paragraphs from listContent with support for nested items
//   private createParagraphs(): Paragraph[] {
//     return this.listContent.map((item) => {
//       if (item.nestedList && Array.isArray(item.nestedList)) {
//         // Handle nested list
//         const nestedParagraphs = item.nestedList.map((nestedItem) =>
//           new Paragraph({
//             text: nestedItem.text,
//             numbering: {
//               reference: 'dynamic-bullets',
//               level: nestedItem.level,
//             },
//             alignment: AlignmentType.LEFT,
//           })
//         );
//         // Add the parent item and then nested items
//         return [
//           new Paragraph({
//             text: item.text,
//             numbering: {
//               reference: 'dynamic-numbering',
//               level: item.level,
//             },
//             alignment: AlignmentType.LEFT,
//           }),
//           ...nestedParagraphs, // Add nested items
//         ];
//       } else {
//         // Handle regular item
//         return new Paragraph({
//           text: item.text,
//           numbering: item.type === 'number'
//             ? { reference: 'dynamic-numbering', level: item.level }
//             : item.noBullet
//             ? undefined // Skip bullets if 'noBullet' is true
//             : { reference: 'dynamic-bullets', level: item.level },
//           alignment: AlignmentType.LEFT,
//         });
//       }
//     }).flat(); // Flatten the nested array
//   }
// }
