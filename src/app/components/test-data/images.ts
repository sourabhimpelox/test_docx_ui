// import { Component } from '@angular/core';
// import { AlignmentType, Document, Packer, Paragraph, SectionType, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';
// import { saveAs } from 'file-saver';

// @Component({
//   selector: 'app-test-data',
//   templateUrl: './test-data.component.html',
//   styleUrls: ['./test-data.component.css']
// })




// export class TestDataComponent {
//   data = [
//     { 'BENEFITS GROUP': 'General', 'BENEFITS HEADERS': 'Regulatory Compliance', 'CATEGORY A': 'DHA', 'CATEGORY B': 'DHA', 'CATEGORY C': 'DHA' },

//     { 'BENEFITS GROUP': 'Policy Details', 'BENEFITS HEADERS': 'TPA', 'CATEGORY A': 'NAS' },

//     { 'BENEFITS GROUP': 'Inpatient Treatment', 'BENEFITS HEADERS': 'Referral Procedure', 'CATEGORY A': 'Not Applicable', 'CATEGORY B': 'Applicable', 'CATEGORY C': 'Applicable' },

//     { 'BENEFITS GROUP': 'Inpatient Treatment', 'BENEFITS HEADERS': 'Referral Procedure----', 'CATEGORY A': 'Not Applicable', 'CATEGORY D': 'hello' },

//   ];
//   getUniqueCategories(): string[] {
//     const categoryKeys = new Set<string>(); // Use a Set to store unique category keys

//     this.data.forEach((row) => {
//       Object.keys(row).forEach((key) => {
//         if (key.startsWith('CATEGORY')) {
//           categoryKeys.add(key); // Add unique keys to the Set
//         }
//       });
//     });

//     return Array.from(categoryKeys); // Convert Set to an array
//   }



//   extractPremiumData = (data: any) => {
//     // Initialize an array to store unique tob_headers
//     const tobHeaders: any = [];

//     // Initialize an object to map each tob_header to its category data
//     const categoryDataMap: any = {};

//     // Process each category in the input data
//     data.forEach((category: any) => {
//       // Determine where `premium_details` is located
//       const premiumDetails: any = category.data?.premium_details || category.premium_details || [];

//       premiumDetails.forEach((pd: any) => {
//         // Add unique tob_header to the array
//         if (!tobHeaders.includes(pd.tob_header)) {
//           tobHeaders.push(pd.tob_header);
//         }

//         // Initialize category data for this tob_header if not already present
//         if (!categoryDataMap[pd.tob_header]) {
//           categoryDataMap[pd.tob_header] = [];
//         }

//         // Add the tob_value to the appropriate index based on the category
//         const categoryIndex = data.findIndex((cat: any) => cat.category_name === category.category_name);
//         categoryDataMap[pd.tob_header][categoryIndex] = pd.tob_value;
//       });
//     });

//     // Prepare the final data structure
//     const tableData = tobHeaders.map((header: any) => {
//       const row = [header]; // Start with tob_header
//       data.forEach((category: any, index: any) => {
//         const value = categoryDataMap[header]?.[index];
//         row.push(value || ''); // Add the value or an empty string
//       });
//       return row;
//     });

//     // Prepare headers with the first column as 'Tob Header' and subsequent columns as category names
//     const headers = ['Tob Header', ...data.map((category: any) => category.category_name)];

//     // Return structured data
//     return {
//       headers,
//       rows: tableData,
//     };
//   };
//   generateDoc() {


//     const groupedTables: Record<string, any[]> = {};
//     for (const row of this.data) {
//       console.log(row);
//       const group = row['BENEFITS GROUP'];
//       if (!groupedTables[group]) {
//         groupedTables[group] = [];
//       }
//       groupedTables[group].push(row);
//     }

//     console.log(groupedTables);

//     const sections = Object.entries(groupedTables).map(([title, rows]) => {
//       console.log(title, rows);
//       return {
//         properties: { type: SectionType.CONTINUOUS },
//         children: [
//           new Paragraph({
//             text: title,
//             heading: 'Heading1',
//             spacing: { after: 200 },
//           }),
//           this.createTable(title, rows),
//         ],
//       }
//     });



//     const doc = new Document({

//       sections,
//     });

//     Packer.toBlob(doc).then((blob) => {
//       saveAs(blob, 'GroupedTables.docx');
//     });
//   }

//   createTable(title: string, data: { 'BENEFITS HEADERS': string; 'CATEGORY A': string }[]): Table {
//     console.log("data", data);

//     const headers: Array<'BENEFITS HEADERS' | 'CATEGORY A'> = ['BENEFITS HEADERS', 'CATEGORY A'];

//     const defaultBorders = {
//       top: { size: 10, color: '000000', space: 0, style: 'single' as const },
//       bottom: { size: 10, color: '000000', space: 0, style: 'single' as const },
//       left: { size: 10, color: '000000', space: 0, style: 'single' as const },
//       right: { size: 10, color: '000000', space: 0, style: 'single' as const },
//     };

//     const titleRow = new TableRow({
//       children: [
//         new TableCell({
//           children: [new Paragraph({
//             children: [
//               new TextRun({
//                 text: title,
//                 size: 25,
//                 color: 'FFFFFF',
//                 font: 'Roboto'
//               }),
//             ],
//             indent: {
//               start: 100,
//             },
//             // spacing: { before: 50, after: 50 },
//             alignment: AlignmentType.CENTER,
//           })],
//           columnSpan: 2,
//           shading: { fill: '1F9557' },

//           borders: defaultBorders,
//         }),
//       ],
//     });

//     // Data Rows: Create a table row for each data entry
//     const dataRows = data.map((row) => {
//       console.log("row", row);
//       return new TableRow({
//         children: headers.map((key) =>
//           new TableCell({
//             children: [new Paragraph({
//               children: [
//                 new TextRun({
//                   text: row[key],
//                   size: 23,
//                   font: 'Roboto'
//                 }),
//               ],
//               indent: {
//                 start: 100,
//               },
//               // spacing: { before: 50, after: 50 }
//             })],
//             width: { size: 50, type: WidthType.PERCENTAGE },
//             borders: defaultBorders,

//           })
//         ),
//       })
//     }
//     );

//     return new Table({
//       width: {
//         size: 100,
//         type: WidthType.PERCENTAGE,
//       },
//       rows: [titleRow, ...dataRows],
//     });
//   }
// }


// let quoteData = {
//   "quotes": [
//     {
//       "data": [
//         {
//           "category_name": "Category A",
//           "data": {
//             "premium_details": [
//               {
//                 "group_details": "Premium",
//                 "tob_header": "GWP",
//                 "tob_value": "AED 287,047.84"
//               },
//               {
//                 "group_details": "Premium",
//                 "tob_header": "Basmah Fee / ICP Fee",
//                 "tob_value": "AED 1184"
//               },
//               {
//                 "group_details": "Premium",
//                 "tob_header": "GWP With Basmah Fee / GWP With ICP Fee",
//                 "tob_value": "AED 288,231.84"
//               },
//               {
//                 "group_details": "Premium",
//                 "tob_header": "VAT",
//                 "tob_value": "AED 14,411.59"
//               },
//               {
//                 "group_details": "Premium",
//                 "tob_header": "Total Premium",
//                 "tob_value": "AED 302,643.41"
//               }
//             ]
//           }
//         },
//         {
//           "category_name": "Category B",
//           "premium_details": [
//             {
//               "group_details": "Premium",
//               "tob_header": "GWP",
//               "tob_value": "AED 287,047.84"
//             },
//             {
//               "group_details": "Premium",
//               "tob_header": "Basmah Fee / ICP Fee",
//               "tob_value": "AED 1184"
//             },
//             {
//               "group_details": "Premium",
//               "tob_header": "GWP With Basmah Fee / GWP With ICP Fee",
//               "tob_value": "AED 288,231.84"
//             },
//             {
//               "group_details": "Premium",
//               "tob_header": "VAT",
//               "tob_value": "AED 14,411.59"
//             },
//             {
//               "group_details": "Premium",
//               "tob_header": "Total Premium",
//               "tob_value": "AED 302,643.41"
//             }
//           ]
//         }
//       ]
//     }
//   ]

// }


// let benifits = {
//   "quotes": [
//     {
//       "data": [
//         {
//           "category_name": "Category A",
//           "data": {
//             "primary_benefits": [
//               {
//                 "group_details": "Policy Details",
//                 "benefits_name": "Territorial Scope of Coverage",
//                 "benefits_options": "Worldwide ",
//               }

//             ]
//           }
//         },
//         {
//           "category_name": "Category B",
//           "data": {
//             "primary_benefits": [
//               {
//                 "group_details": "Policy Details",
//                 "benefits_name": "Territorial Scope of Coverage",
//                 "benefits_options": "Worldwide ",
//               }

//             ]
//           }
//         },

//       ]
//     }
//   ]
// }


// let obj = {
//   "Policy Details": {
//     "Territorial Scope of Coverage": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Worldwide "
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Worldwide "
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "Worldwide "
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Worldwide "
//       }
//     ],
//     "Aggregate Annual Limit": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "AED 1 Million"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "AED 1 Million"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "AED 1 Million"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "AED 1 Million"
//       }
//     ],
//     "Medical Network ": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "NEXTCARE GN"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "NEXTCARE RN"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "NEXTCARE GN"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "NEXTCARE RN"
//       }
//     ],
//     "Pre-existing & Chronic Conditions": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Covered up to the Annual limit subject to the following:\r\n\r\nAnnual limit applies if evidence of continuity of coverage (COC) in UAE is provided; otherwise, the limit will be restricted to AED 150,000/- PPPA. \r\n\r\nPre-existing and/or ongoing chronic conditions should be declared as per the Group Health Declaration form and/or in the medical application form (MAF) for all members above 60 years old and for all the groups below 20 members and is subject to medical underwriting. Undeclared medical conditions will not be covered during the policy period.\r\n \r\nAny form of Cancer shall fall within the definition of Chronic conditions."
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Covered up to the Annual limit subject to the following:\r\n\r\nAnnual limit applies if evidence of continuity of coverage (COC) in UAE is provided; otherwise, the limit will be restricted to AED 150,000/- PPPA. \r\n\r\nPre-existing and/or ongoing chronic conditions should be declared as per the Group Health Declaration form and/or in the medical application form (MAF) for all members above 60 years old and for all the groups below 20 members and is subject to medical underwriting. Undeclared medical conditions will not be covered during the policy period.\r\n \r\nAny form of Cancer shall fall within the definition of Chronic conditions."
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "Covered up to Annual Limit\r\nMAF is mandatory for all members above 60 years old and for all the groups below 20 members "
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Covered up to Annual Limit\r\nMAF is mandatory for all members above 60 years old and for all the groups below 20 members "
//       }
//     ]
//   },
//   "In-patient & Day Care Health Services at Authorized Hospitals": {
//     "Room type": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Private"
//       }
//     ],
//     "Parent Accommodation for child under 18 years of age": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "AED 350 / day"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "AED 350 / day"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "AED 350 / day"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "AED 350 / day"
//       }
//     ],
//     "Accommodation of an accompanying person in the same room as per recommendation of attending physician, subject to prior approval.": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "AED 350 / day"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "AED 350 / day"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "AED 350 / day"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "AED 350 / day"
//       }
//     ],
//     "In-patient Room Type": [
//       {
//         "category_name": "Category B",
//         "benefits_options": "Private"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "Private"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Private"
//       }
//     ]
//   },
//   "Out-patient Health Services": {
//     "Consultation": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Covered"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Covered"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "Covered"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Covered"
//       }
//     ],
//     "Deductible per Consultation": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "20% Max AED 50/-"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "20% Max AED 50/-"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "AED 50/-"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "AED 50/-"
//       }
//     ],
//     "Prescribed Drugs & Medicines Annual Limit": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "AED 7500"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "AED 7500"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "AED 7500"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "AED 7500"
//       }
//     ],
//     "Prescribed Drugs & Medicines Co-pay": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "20% Co-pay"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "20% Co-pay"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "20% Co-pay"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "20% Co-pay"
//       }
//     ],
//     "Diagnostics Co-pay": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "20% Co-pay"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "20% Co-pay"
//       }
//     ],
//     "Diagnostics ( X-ray, MRI, CT-Scan, Ultra Sound& Endoscopy diagonistic services )": [
//       {
//         "category_name": "Category C",
//         "benefits_options": "Covered without Co-pay and up to aggregate annual limit"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Covered without Co-pay and up to aggregate annual limit"
//       }
//     ]
//   },
//   "Other Benefits ": {
//     "Home Nursing Hospitalization": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Covered up to Maximum AED 10,000 per person per annum"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Covered up to Maximum AED 10,000 per person per annum"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "Covered up to Maximum AED 10,000 per person per annum"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Covered up to Maximum AED 10,000 per person per annum"
//       }
//     ],
//     "Emergency road ambulance services to and from hospital by registered ambulance services provider": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Covered"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Covered"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "Covered"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Covered"
//       }
//     ],
//     "Cash Indemnity for In-Patient Treatment post hospitlization up to max of 15 days, subject to providing discharge summary or proof of hospitalization": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "AED 250 per night\r\nApplicable to all inpatient hospitalizations that are not submitted to the Insurance Company"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "AED 250 per night\r\nApplicable to all inpatient hospitalizations that are not submitted to the Insurance Company"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "AED 200 per night\r\nApplicable to all inpatient hospitalizations that are not submitted to the Insurance Company"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "AED 200 per night\r\nApplicable to all inpatient hospitalizations that are not submitted to the Insurance Company"
//       }
//     ],
//     "Essential vaccinations and inoculations for newborns and children as stipulated in the DHA’s policies and its updates (currently the same as Federal MOH)": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Inside Network: 100% Actual Cost\r\nOutside Network : UCR Basis "
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Inside Network: 100% Actual Cost\r\nOutside Network : UCR Basis "
//       }
//     ],
//     "Physiotherapy ( Subject to pre-approval) ": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "20 sessions per member per annum"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "20 sessions per member per annum"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "Covered"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Covered"
//       }
//     ],
//     "Preventive services, vaccines and immunizations": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Frequency restricted to:\r\nDiabetes: Every 3 years from age 30\r\nHigh risk individuals annually from age 18"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Frequency restricted to:\r\nDiabetes: Every 3 years from age 30\r\nHigh risk individuals annually from age 18"
//       }
//     ],
//     "Diagnostic and treatment services for dental and gum treatments( Emergency cases Only) \r\nDental emergency is any injury to your teeth or gums that can put you at a risk of permanent damage, such as Chipped or broken teeth, Knocked-out tooth ,Soft-tissue injuries and etc": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Covered "
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Covered "
//       }
//     ],
//     "Hearing and vision aids, and vision correction by surgeries and laser ( Emergency cases Only)\r\nHearing Emergencies include Object/insect in the ear , ruptued eardrum ,  sudden hearing loss and etc\r\nVision Emergencies include  bleeding or discharge from or around the eye, double vision and Loss of vision, total or partial, one eye or both etc.": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Covered "
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Covered "
//       }
//     ],
//     "Kidney Dialysis Treatment\r\nCoverage for hemodialysis or peritoneal dialysis": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Covered up to Maximum AED 35,000 per person per annum"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Covered up to Maximum AED 35,000 per person per annum"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "Covered up to Maximum AED 35,000 per person per annum"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Covered up to Maximum AED 35,000 per person per annum"
//       }
//     ],
//     "Healthcare services for work illnesses and injuries as per Federal Law No.8 of 1980 concerning the Regulation of Work Relations, as amended, and applicable laws in this respect": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Covered up to Maximum AED 10,000 per person per annum"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Covered up to Maximum AED 10,000 per person per annum"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "Covered"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Covered"
//       }
//     ],
//     "Adult Pneumococcal Conjugate Vaccine": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Covered as per DHA Adult Pneumococcal Vaccination guidelines"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Covered as per DHA Adult Pneumococcal Vaccination guidelines"
//       }
//     ],
//     "Cancer Treatment\r\n Screening, Healthcare Services, Investigations and Treatments only for members enrolled under Patient Support Program only": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Covered as per the Terms,Conditions and Exclusions of the program defined by DHA."
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Covered as per the Terms,Conditions and Exclusions of the program defined by DHA."
//       }
//     ],
//     "Hepatitis B & C Virus Screening and Treatment\r\n Screening, Healthcare Services, Investigations and Treatments only for members enrolled under Patient Support Program only": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Covered as per the Terms,Conditions and Exclusions of the program defined by DHA."
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Covered as per the Terms,Conditions and Exclusions of the program defined by DHA."
//       }
//     ],
//     "Influenza Vaccine": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Covered once per Annum"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Covered once per Annum"
//       }
//     ],
//     "Psychiatric and Mental Health": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "In-Patient, Out-Patient, and Emergency cover up to a maximum of AED 10,000/- per person per annum.\r\n\r\n20% coinsurance payable by the insured per visit for Out-Patient services.\r\nNo coinsurance is applicable if a follow-up vist is made within seven days"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "In-Patient, Out-Patient, and Emergency cover up to a maximum of AED 10,000/- per person per annum.\r\n\r\n20% coinsurance payable by the insured per visit for Out-Patient services.\r\nNo coinsurance is applicable if a follow-up vist is made within seven days"
//       }
//     ],
//     "Repatriation of Mortal Remains to the Country of Domicile:": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Covered up to Maximum AED 20,000 per person per annum settled on Reimbursement basis with no co-pay"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Covered up to Maximum AED 20,000 per person per annum settled on Reimbursement basis with no co-pay"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "Covered up to Maximum AED 20,000 per person per annum"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Covered up to Maximum AED 20,000 per person per annum"
//       }
//     ],
//     "Second Medical Opinion": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "This benefit gives members access through NEXtCARE mobile application to world renowned  providers to re-evaluate their earlier diagnosis, medical history and treatment plan for non-emergency cases.\r\nCardholder is entitled to use the Second Medical Opinion service two times within the 12 months Policy validity period. "
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "This benefit gives members access through NEXtCARE mobile application to world renowned  providers to re-evaluate their earlier diagnosis, medical history and treatment plan for non-emergency cases.\r\nCardholder is entitled to use the Second Medical Opinion service two times within the 12 months Policy validity period. "
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "This benefit gives members access through NEXtCARE mobile application to world renowned  providers to re-evaluate their earlier diagnosis, medical history and treatment plan for non-emergency cases.\r\nCardholder is entitled to use the Second Medical Opinion service two times within the 12 months Policy validity period."
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "This benefit gives members access through NEXtCARE mobile application to world renowned  providers to re-evaluate their earlier diagnosis, medical history and treatment plan for non-emergency cases.\r\nCardholder is entitled to use the Second Medical Opinion service two times within the 12 months Policy validity period."
//       }
//     ],
//     "Symptom Checker": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "This benefit gives members access through NEXtCARE mobile application to a tool that uses artificial intelligence algorithms to anonymously analyze the member’s symptoms and medical history to suggest the most probable diagnosis and route of care. "
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "This benefit gives members access through NEXtCARE mobile application to a tool that uses artificial intelligence algorithms to anonymously analyze the member’s symptoms and medical history to suggest the most probable diagnosis and route of care. "
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "This benefit gives members access through NEXtCARE mobile application to a tool that uses artificial intelligence algorithms to anonymously analyze the member’s symptoms and medical history to suggest the most probable diagnosis and route of care."
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "This benefit gives members access through NEXtCARE mobile application to a tool that uses artificial intelligence algorithms to anonymously analyze the member’s symptoms and medical history to suggest the most probable diagnosis and route of care."
//       }
//     ],
//     "Dental benefit": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "AED 3,500 with 20% Co-pay"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Not Covered"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "AED 3,500 with 20% Co-pay"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Not Covered"
//       }
//     ],
//     "Optical benefit": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "AED 1,500 with 20% Co-pay"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Not Covered"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "AED 1,000 with 20% Co-pay"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Not Covered"
//       }
//     ],
//     "Alternative Medicine\r\nCovers the following: Ayurveda, Chiropractic, Chinese Medicine, and Homeopathy": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Limited to AED 3,000 per person per annum\r\n\r\n20% coinsurance payable by the insured per visit. No coinsurance is applicable if a follow-up visit is made within seven days\r\n\r\nThe claims will be settled on reimbursement basis, and only from providers which are recognized and approved by Nextcare as alternative preferred providers - refer to Nextcare website for details"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Limited to AED 3,000 per person per annum\r\n\r\n20% coinsurance payable by the insured per visit. No coinsurance is applicable if a follow-up visit is made within seven days\r\n\r\nThe claims will be settled on reimbursement basis, and only from providers which are recognized and approved by Nextcare as alternative preferred providers - refer to Nextcare website for details"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "Limited to AED 2,000 per person per annum\r\n\r\n20% coinsurance payable by the insured per visit. No coinsurance is applicable if a follow-up visit is made within seven days\r\n\r\nThe claims will be settled on reimbursement basis, and only from providers which are recognized and approved by Nextcare as alternative preferred providers - refer to Nextcare website for details"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Limited to AED 2,000 per person per annum\r\n\r\n20% coinsurance payable by the insured per visit. No coinsurance is applicable if a follow-up visit is made within seven days\r\n\r\nThe claims will be settled on reimbursement basis, and only from providers which are recognized and approved by Nextcare as alternative preferred providers - refer to Nextcare website for details"
//       }
//     ],
//     "Organ Transplant": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Organ transplantation shall cover the organ transplantation as recipient excluding any cost related to donor, and excluding the acquisition and organ cost\r\nOrgans covered are: heart, lung, kidney, pancreas, liver, Allogeneic & autologous bone marrow."
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Organ transplantation shall cover the organ transplantation as recipient excluding any cost related to donor, and excluding the acquisition and organ cost\r\nOrgans covered are: heart, lung, kidney, pancreas, liver, Allogeneic & autologous bone marrow."
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "Organ transplantation shall cover the organ transplantation as recipient excluding any cost related to donor, and excluding the acquisition and organ cost\r\nOrgans covered are: heart, lung, kidney, pancreas, liver, Allogeneic & autologous bone marrow."
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Organ transplantation shall cover the organ transplantation as recipient excluding any cost related to donor, and excluding the acquisition and organ cost\r\nOrgans covered are: heart, lung, kidney, pancreas, liver, Allogeneic & autologous bone marrow."
//       }
//     ],
//     "New Born Cover": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Covered as per the Terms,Conditions and Exclusions defined by DHA."
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Covered as per the Terms,Conditions and Exclusions defined by DHA."
//       }
//     ],
//     "Medical Advice Service “See A Doctor” (UAE)": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "This benefit gives members access through NEXtCARE mobile application to a qualified doctor, for general medical advice and instructions for self-care or recommendations on medications. For users calling from the UAE only, the physician can issue a prescription for the recommended medications. The service can only be accessed during the validity period of the policy coverage."
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "This benefit gives members access through NEXtCARE mobile application to a qualified doctor, for general medical advice and instructions for self-care or recommendations on medications. For users calling from the UAE only, the physician can issue a prescription for the recommended medications. The service can only be accessed during the validity period of the policy coverage."
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "This benefit gives members access through NEXtCARE mobile application to a highly qualified doctor, for general medical advice and instructions for self-care or recommendations on medications. For users calling from the UAE only, the physician can issue a prescription for the recommended medications. The service can only be accessed during the validity period of the policy coverage."
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "This benefit gives members access through NEXtCARE mobile application to a highly qualified doctor, for general medical advice and instructions for self-care or recommendations on medications. For users calling from the UAE only, the physician can issue a prescription for the recommended medications. The service can only be accessed during the validity period of the policy coverage."
//       }
//     ],
//     "Return Airfare Ticket \r\nfor In-Patient treatment at home country": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "This benefit can be covered subject to the following guidelines:\r\n\r\n - Cost of In-Patient treatment at home country is 50% or less compared to the cost of the same treatment and applicable network charges in UAE\r\n - Covered only for the patient (i.e. excluding accompanying persons)\r\n - Only on reimbursement basis, and subject to pre-approval\r\n - Covered up to a maximum of AED 3,000 for the round trip ticket"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "This benefit can be covered subject to the following guidelines:\r\n\r\n - Cost of In-Patient treatment at home country is 50% or less compared to the cost of the same treatment and applicable network charges in UAE\r\n - Covered only for the patient (i.e. excluding accompanying persons)\r\n - Only on reimbursement basis, and subject to pre-approval\r\n - Covered up to a maximum of AED 3,000 for the round trip ticket"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "This benefit can be covered subject to the following guidelines:\r\n \r\n - Cost of In-Patient treatment at home country is 50% or less compared to the cost of the same treatment and applicable network charges in UAE\r\n - Covered only for the patient (i.e. excluding accompanying persons)\r\n - Only on reimbursement basis, and subject to pre-approval\r\n - Covered up to a maximum of AED 3,000 for the round trip ticket"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "This benefit can be covered subject to the following guidelines:\r\n \r\n - Cost of In-Patient treatment at home country is 50% or less compared to the cost of the same treatment and applicable network charges in UAE\r\n - Covered only for the patient (i.e. excluding accompanying persons)\r\n - Only on reimbursement basis, and subject to pre-approval\r\n - Covered up to a maximum of AED 3,000 for the round trip ticket"
//       }
//     ],
//     "Wellness Benefit": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Coverage for an Annual Health Check-up Package with NEXtCARE partner providers, subject to a 20% coinsurance and the following annual limits (as per the member's Medical Out-Patient Network): \r\n\r\nGN+ :   AED 1,500\r\nGN :   AED 1,000\r\nGN Excluding Mediclinic, Al Zahra & HMG and RN :  AED 500\r\nRN2 :   Not Covered\r\nRN3 :   Not Covered\r\n\r\nMember to check with NEXtCARE the latest list of approved packages. Coverage on Reimbursement basis only."
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Coverage for an Annual Health Check-up Package with NEXtCARE partner providers, subject to a 20% coinsurance and the following annual limits (as per the member's Medical Out-Patient Network): \r\n\r\nGN+ :   AED 1,500\r\nGN :   AED 1,000\r\nGN Excluding Mediclinic, Al Zahra & HMG and RN :  AED 500\r\nRN2 :   Not Covered\r\nRN3 :   Not Covered\r\n\r\nMember to check with NEXtCARE the latest list of approved packages. Coverage on Reimbursement basis only."
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "Coverage for an Annual Health Check-up Package with NEXtCARE partner providers, subject to a 20% coinsurance and the following annual limits (as per the member's Medical Out-Patient Network): \r\n\r\nGN+ : AED 1,500\r\nGN : AED 1,000\r\nRN : AED 500\r\nRN2 : Not Covered\r\nRN3 : Not Covered\r\n\r\nMember to check with NEXtCARE the latest list of approved packages. Coverage on Reimbursement basis only."
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Coverage for an Annual Health Check-up Package with NEXtCARE partner providers, subject to a 20% coinsurance and the following annual limits (as per the member's Medical Out-Patient Network): \r\n\r\nGN+ : AED 1,500\r\nGN : AED 1,000\r\nRN : AED 500\r\nRN2 : Not Covered\r\nRN3 : Not Covered\r\n\r\nMember to check with NEXtCARE the latest list of approved packages. Coverage on Reimbursement basis only."
//       }
//     ],
//     "Vaccination for Children ( as per MOH, UAE)": [
//       {
//         "category_name": "Category C",
//         "benefits_options": "Inside Network: 100% Actual Cost\r\nOutside Network : UCR Basis "
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Inside Network: 100% Actual Cost\r\nOutside Network : UCR Basis "
//       }
//     ],
//     "Diagnostic and treatment services for dental and gum treatments, Hearing and vision aids, and vision correction by surgeries and laser (Emergency cases Only)\r\nDental emergency is any injury to your teeth or gums that can put you at a risk of permanent damage, such as Chipped or broken teeth, Knocked-out tooth ,Soft-tissue injuries and etc\r\nHearing Emergencies include Object/insect in the ear , ruptued eardrum ,  sudden hearing loss and etc\r\nVision Emergencies include  bleeding or discharge from or around the eye, double vision and Loss of vision, total or partial, one eye or both etc.": [
//       {
//         "category_name": "Category C",
//         "benefits_options": "Covered "
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Covered "
//       }
//     ],
//     "Transient mental disorder or acute reaction to stress": [
//       {
//         "category_name": "Category C",
//         "benefits_options": "Covered"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Covered"
//       }
//     ]
//   },
//   "BASIS OF CLAIMS SETTLEMENT": {
//     "Claims Settlement In-Patient:\r\n1. UAE within the Network- Direct Billing\r\n2. Area of coverage as per Territorial Scope / Outside the Network / With or without prior approval of the ceding company - Reimbursement basis only\r\n\r\nClaims Settlement Out-Patient:\r\n1. UAE within the Network - Direct Billing\r\n2. Area of coverage as per Territorial Scope / Outside the Network - Reimbursement basis only\r\nReimbursement in Emergency Cases:\r\n(emergency treatment must be notified within 24 hours if treatment was received within UAE)\r\n\r\nEligible Treatment\r\nUAE\r\nInside Territorial Scope\r\nOutside Territorial Scope": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% of incurred costs\r\n100% of incurred costs\r\n100% of incurred cost"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% of incurred costs\r\n100% of incurred costs\r\n100% of incurred cost"
//       }
//     ],
//     "Claims Settlement In-Patient:\r\n1. UAE within the Network- Direct Billing\r\n2. Area of coverage as per Territorial Scope / Outside the Network / With or without prior approval of the ceding company - Reimbursement basis only\r\n\r\nClaims Settlement Out-Patient:\r\n1. UAE within the Network - Direct Billing\r\n2. Area of coverage as per Territorial Scope / Outside the Network - Reimbursement basis only\r\n\r\nReimbursement in Emergency Cases:\r\n(emergency treatment must be notified within 24 hours if treatment was received within UAE)\r\n\r\nEligible Treatment\r\nUAE\r\nInside Territorial Scope\r\nOutside Territorial Scope": [
//       {
//         "category_name": "Category C",
//         "benefits_options": "100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% of incurred costs\r\n100% of incurred costs\r\n100% of incurred costs"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% after applicable co-pay \r\n80% of actual costs or 80% of the UCR as per UAE network tariffs for same or similar treatment whichever is less\r\n\r\n100% of incurred costs\r\n100% of incurred costs\r\n100% of incurred costs"
//       }
//     ]
//   },
//   "Maternity Benefits                        ": {
//     "Maternity Benefits                        ": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Subject to coinsurance and sub-limits"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Subject to coinsurance and sub-limits"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "Subject to conditions"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Subject to conditions"
//       }
//     ],
//     "In-patient Maternity services      ": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "In-patient maternity services:  \r\n10% coinsurance payable by the insured, Maximum benefit (4 options)\r\nDefault for GN+: 20,000 AED per delivery\r\nOption 1: GN - 15,000 AED per delivery\r\nOption 2: GN Excluding Mediclinic, Al Zahra & HMG - 13,500 AED per delivery                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Option 3: RN - 12,500 AED per delivery\r\nOption 4: RN2 and RN3 - 10,000 AED per delivery\r\n\r\n(All limits include coinsurance)\r\n\r\nIn-patient maternity services\r\nRequires prior approval from the insurance company or within 24 hours of emergency treatment\r\n10% coinsurance payable by the insured"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "In-patient maternity services:  \r\n10% coinsurance payable by the insured, Maximum benefit (4 options)\r\nDefault for GN+: 20,000 AED per delivery\r\nOption 1: GN - 15,000 AED per delivery\r\nOption 2: GN Excluding Mediclinic, Al Zahra & HMG - 13,500 AED per delivery                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Option 3: RN - 12,500 AED per delivery\r\nOption 4: RN2 and RN3 - 10,000 AED per delivery\r\n\r\n(All limits include coinsurance)\r\n\r\nIn-patient maternity services\r\nRequires prior approval from the insurance company or within 24 hours of emergency treatment\r\n10% coinsurance payable by the insured"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "Inside Abu Dhabi & Al Ain: Covered up to the Annual Limit of the policy ( In-Patient & Out-Patient)                                                                                                                Delivery inside Abu Dhabi & Al Ain is subject to a deductible of AED 500/- as per HAAD law\r\nOutside Abu Dhabi & Al Ain: Normal Delivery is covered up to AED 10,000/-, C-Section and maternity complications are covered up to AED  12,000/-, Medical Emergency related to Maternity  is covered up to AED 150,000/-"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Inside Abu Dhabi & Al Ain: Covered up to the Annual Limit of the policy ( In-Patient & Out-Patient)                                                                                                                Delivery inside Abu Dhabi & Al Ain is subject to a deductible of AED 500/- as per HAAD law\r\nOutside Abu Dhabi & Al Ain: Normal Delivery is covered up to AED 10,000/-, C-Section and maternity complications are covered up to AED  12,000/-, Medical Emergency related to Maternity  is covered up to AED 150,000/-"
//       }
//     ],
//     "Out-patient Maternity services      ": [
//       {
//         "category_name": "Category A",
//         "benefits_options": "Out-patient maternity services: \r\n10% coinsurance payable by the insured\r\nmaximum 8 visits are allowed (as per applicable network);\r\nInitial investigations to include:\r\n- FBC and Platelets\r\n- Blood group, Rhesus status and antibodies\r\n- VDRL\r\n- MSU & urinalysis\r\n- Rubella serology\r\n- HIV\r\n- Hep C offered to high risk patients\r\n- GTT if high risk\r\n- FBS , random s or A1c for all due to high prevalence of diabetes in UAE\r\nVisits to include reviews, checks and tests in accordance with DHA Antenatal Care Protocols\r\n3 ante-natal ultrasound scans"
//       },
//       {
//         "category_name": "Category B",
//         "benefits_options": "Out-patient maternity services: \r\n10% coinsurance payable by the insured\r\nmaximum 8 visits are allowed (as per applicable network);\r\nInitial investigations to include:\r\n- FBC and Platelets\r\n- Blood group, Rhesus status and antibodies\r\n- VDRL\r\n- MSU & urinalysis\r\n- Rubella serology\r\n- HIV\r\n- Hep C offered to high risk patients\r\n- GTT if high risk\r\n- FBS , random s or A1c for all due to high prevalence of diabetes in UAE\r\nVisits to include reviews, checks and tests in accordance with DHA Antenatal Care Protocols\r\n3 ante-natal ultrasound scans"
//       },
//       {
//         "category_name": "Category C",
//         "benefits_options": "Covered up to the Annual Limit of the policy subject to the same deductible in the selected plan on consultation"
//       },
//       {
//         "category_name": "Category D",
//         "benefits_options": "Covered up to the Annual Limit of the policy subject to the same deductible in the selected plan on consultation"
//       }
//     ]
//   }
// }

// let quoteData = {
//     "exclusion": [
//         {
//             "emirates": "Abu Dhabi",
//             "exclusion": [
//                 {
//                     "heading": "1.\tHealthcare Services which are not medically necessary",
//                     "bulletPoints": [],
//                     "title": "other"
//                 },
//                 {
//                     "heading": "2.\tAll expenses relating to dental treatment, dental prostheses, and orthodontic treatments.",
//                     "bulletPoints": [
//                         "Non-medical treatment services.",
//                         "Health-related services which do not seek to improve, or which do not result in a change in the medical condition of the patient."
//                     ],
//                     "title": "other"
//                 },
//             ]
//         },
//         {
//             "emirates": "Dubai",
//             "exclusion": [
//                 {
//                     "heading": "1.\tHealthcare Services which are not medically necessary",
//                     "bulletPoints": [],
//                     "title": "other"
//                 },
//                 {
//                     "heading": "2.\tAll expenses relating to dental treatment, dental prostheses, and orthodontic treatments.",
//                     "bulletPoints": [],
//                     "title": "other"
//                 },
//             ]
//         }
//     ]
// }


let ageband = {
    "quotes": [
        {
            "data": [
                {
                    "category_name": "Category C",
                    "vat": 0.05,
                    "GWP_With_Vat": 3546.65,
                    "totalBasmahFee": 259,
                    "totalIcpFee": null,
                    "pdfAgeBandDetails": [
                        {
                            "age": "0-10",
                            "maternityCount": 0,
                            "maternityGrossPremium": 0,
                            "maternityTotalGrossPremium": 0,
                            "Employee": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 0,
                                "femaleGrossPremium": 0,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            },
                            "Dependents": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 3149.2,
                                "femaleGrossPremium": 2826.02,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            }
                        },
                        {
                            "age": "11-17",
                            "maternityCount": 0,
                            "maternityGrossPremium": 0,
                            "maternityTotalGrossPremium": 0,
                            "Employee": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 0,
                                "femaleGrossPremium": 0,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            },
                            "Dependents": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 2238.52,
                                "femaleGrossPremium": 2554.19,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            }
                        },
                        {
                            "age": "18-25",
                            "maternityCount": 6,
                            "maternityGrossPremium": 2482.03,
                            "maternityTotalGrossPremium": 14892.16,
                            "Employee": {
                                "maleCount": 0,
                                "femaleCount": 3,
                                "maleGrossPremium": 2792.51,
                                "femaleGrossPremium": 3029.23,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 9087.69
                            },
                            "Dependents": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 2792.51,
                                "femaleGrossPremium": 3029.23,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            }
                        },
                        {
                            "age": "26-30",
                            "maternityCount": 0,
                            "maternityGrossPremium": 0,
                            "maternityTotalGrossPremium": 0,
                            "Employee": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 3017.21,
                                "femaleGrossPremium": 3710.54,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            },
                            "Dependents": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 3017.21,
                                "femaleGrossPremium": 3710.54,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            }
                        },
                        {
                            "age": "31-35",
                            "maternityCount": 0,
                            "maternityGrossPremium": 0,
                            "maternityTotalGrossPremium": 0,
                            "Employee": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 3593.98,
                                "femaleGrossPremium": 4388.24,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            },
                            "Dependents": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 3593.98,
                                "femaleGrossPremium": 4388.24,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            }
                        },
                        {
                            "age": "36-40",
                            "maternityCount": 0,
                            "maternityGrossPremium": 0,
                            "maternityTotalGrossPremium": 0,
                            "Employee": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 4385.83,
                                "femaleGrossPremium": 5421.61,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            },
                            "Dependents": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 4385.83,
                                "femaleGrossPremium": 5421.61,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            }
                        },
                        {
                            "age": "41-45",
                            "maternityCount": 0,
                            "maternityGrossPremium": 0,
                            "maternityTotalGrossPremium": 0,
                            "Employee": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 5103.19,
                                "femaleGrossPremium": 6880.35,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            },
                            "Dependents": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 5103.19,
                                "femaleGrossPremium": 6880.35,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            }
                        },
                        {
                            "age": "46-50",
                            "maternityCount": 0,
                            "maternityGrossPremium": 0,
                            "maternityTotalGrossPremium": 0,
                            "Employee": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 6597.98,
                                "femaleGrossPremium": 8550.57,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            },
                            "Dependents": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 6597.98,
                                "femaleGrossPremium": 8550.57,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            }
                        },
                        {
                            "age": "51-55",
                            "maternityCount": 0,
                            "maternityGrossPremium": 0,
                            "maternityTotalGrossPremium": 0,
                            "Employee": {
                                "maleCount": 2,
                                "femaleCount": 0,
                                "maleGrossPremium": 8759.65,
                                "femaleGrossPremium": 11186.88,
                                "maleTotalGrossPremium": 17519.3,
                                "femaleTotalGrossPremium": 0
                            },
                            "Dependents": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 8759.65,
                                "femaleGrossPremium": 11186.88,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            }
                        },
                        {
                            "age": "56-59",
                            "maternityCount": 0,
                            "maternityGrossPremium": 0,
                            "maternityTotalGrossPremium": 0,
                            "Employee": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 11835.74,
                                "femaleGrossPremium": 13633.33,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            },
                            "Dependents": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 11835.74,
                                "femaleGrossPremium": 13633.33,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            }
                        },
                        {
                            "age": "60-64",
                            "maternityCount": 0,
                            "maternityGrossPremium": 0,
                            "maternityTotalGrossPremium": 0,
                            "Employee": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 14505.7,
                                "femaleGrossPremium": 16147.08,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            },
                            "Dependents": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 14505.7,
                                "femaleGrossPremium": 16147.08,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            }
                        },
                        {
                            "age": "65-99",
                            "maternityCount": 0,
                            "maternityGrossPremium": 0,
                            "maternityTotalGrossPremium": 0,
                            "Employee": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 26110.25,
                                "femaleGrossPremium": 29064.74,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            },
                            "Dependents": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 26110.25,
                                "femaleGrossPremium": 29064.74,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            }
                        },
                        {
                            "age": "Total",
                            "maternityCount": 6,
                            "maternityGrossPremium": 2482.03,
                            "maternityTotalGrossPremium": 14892.16,
                            "Dependents": {
                                "maleCount": 0,
                                "femaleCount": 0,
                                "maleGrossPremium": 92089.76,
                                "femaleGrossPremium": 107392.78,
                                "maleTotalGrossPremium": 0,
                                "femaleTotalGrossPremium": 0
                            },
                            "Employee": {
                                "maleCount": 2,
                                "femaleCount": 3,
                                "maleGrossPremium": 86702.04,
                                "femaleGrossPremium": 102012.57,
                                "maleTotalGrossPremium": 17519.3,
                                "femaleTotalGrossPremium": 9087.69
                            }
                        }
                    ],

                },
                {
                    "category_name": "Category C",
                    "vat": 0.05,
                    "GWP_With_Vat": 3546.65,
                    "totalBasmahFee": 259,
                    "totalIcpFee": null,
                    "pdfAgeBandDetails": []
                }
             
            ]
        }
    ]
} 



let ageband = {
    // "quotes": [
    //     {
    //         "data": [
    //             {
    //                "category_name": "Category A",
    //               "category_premium": 302643.41,
    //               "category_table_id": 1275,
    //               "GWP": 287047.84,
    //               "GWP_With_BasmahFee": 288231.84,
    //               "GWP_With_IcpFee": null,
                 

    //             },
    //             {
    //                 "category_name": "Category C",
    //                 "vat": 0.05,
    //                 "GWP_With_Vat": 3546.65,
    //                 "totalBasmahFee": 259,
    //                 "totalIcpFee": null,
    //                 "pdfAgeBandDetails": []
    //             }
             
    //         ]
    //     }
    // ]

    let quoteData={

    "quotes": [
        {
            "option_name": "option 1",
            "option_id": 0,
            "GWP": 607142.31,
            "option_premium": 640674.62,
            "currency": "AED",
            "quote_type": "indicative",
            "quote_status": "quote_sent",
            "risk_type": "maf",
            "company_id": 643,
            "quote_id": 822,
            "selector": true,
            "quoteMasterStatus": "quote_sent",
            "stamp_duty": null,
            "vat": null,
            "quoteCreatedDate": "2024-12-06T05:06:24.000Z",
            "optionPremiumWithoutCharges": null,
            "minimumQuotePremium": 453156.47,
            "optionPremiumWithoutLoading": 573615.75,
            "specialRiskType": null,
            "data": [
                {
                    "category_id": 2,
                    "category_name": "Category B",
                    "category_premium": 98631.91,
                    "category_table_id": 1277,
                    "GWP": 93791.15,
                    "GWP_With_BasmahFee": null,
                    "GWP_With_IcpFee": 93935.15,
                    "vat": 0.05,
                    "GWP_With_Vat": 4696.76,
                    "totalBasmahFee": null,
                    "totalIcpFee": 144,
                    "minimumCategoryPremium": 70192,
                    
                    "census": [],
                    "member_count": 6
                },
                {
                    "category_id": 2,
                    "category_name": "Category C",
                    "category_premium": 98631.91,
                    "category_table_id": 1277,
                    "GWP": 93791.15,
                    "GWP_With_BasmahFee": null,
                    "GWP_With_IcpFee": 93935.15,
                    "vat": 0.05,
                    "GWP_With_Vat": 4696.76,
                    "totalBasmahFee": null,
                    "totalIcpFee": 144,
                    "minimumCategoryPremium": 70192,
                    
                    "census": [
                        {
                            "census_id": 24215,
                            "category_id": 1277,
                            "serial_no": 75,
                            "employee_id": 30001,
                            "relations": "Employee",
                            "dob": "08-09-1953",
                            "gender": "Male",
                            "marital_status": "Married",
                            "nationality": "IRELAND",
                            "visa_issuance_emirate": "Abu Dhabi",
                            "category": "category c",
                            "maternity_premium": null,
                            "minimum_maternity_premium": null,
                            "updated_maternity_premium": 0,
                            "updated_maternity_gross_net_premium": 0,
                            "is_maternity_eligible": 0,
                            "client_reference_number": "MG-SME-1224-1-00092",
                            "from_age": 60,
                            "to_age": 90,
                            "updated_loaded_premium": 23078.48,
                            "version": 2,
                            "employee_name": "John Kieran Hartnett",
                            "member_type": "HSB",
                            "gross_net_premium": 18232,
                            "base_premium": 17679,
                            "minimum_premium": 8674,
                            "totalCommission": 0.21,
                            "displayCensusPremium": null,
                            "displayCensusMaternityPremium": null,
                            "commissions": null,
                            "commission": null,
                            "maf_risk": "1",
                            "premium": 23078.48,
                            "originalCensusId": 25374,
                            "file_name": null,
                            "file_path": null,
                            "folder_type": null,
                            "age": 71
                        },
                        {
                            "census_id": 24216,
                            "category_id": 1277,
                            "serial_no": 76,
                            "employee_id": 30001,
                            "relations": "Spouse",
                            "dob": "06-07-1957",
                            "gender": "Female",
                            "marital_status": "Married",
                            "nationality": "IRELAND",
                            "visa_issuance_emirate": "Abu Dhabi",
                            "category": "category c",
                            "maternity_premium": null,
                            "minimum_maternity_premium": null,
                            "updated_maternity_premium": 0,
                            "updated_maternity_gross_net_premium": 0,
                            "is_maternity_eligible": 0,
                            "client_reference_number": "MG-SME-1224-1-00092",
                            "from_age": 60,
                            "to_age": 90,
                            "updated_loaded_premium": 23078.48,
                            "version": 2,
                            "employee_name": "Elizabeth Hartnett Hartnett",
                            "member_type": "HSB",
                            "gross_net_premium": 18232,
                            "base_premium": 17679,
                            "minimum_premium": 18073,
                            "totalCommission": 0.21,
                            "displayCensusPremium": null,
                            "displayCensusMaternityPremium": null,
                            "commissions": null,
                            "commission": null,
                            "maf_risk": "1",
                            "premium": 23078.48,
                            "originalCensusId": 25375,
                            "file_name": null,
                            "file_path": null,
                            "folder_type": null,
                            "age": 67
                        }
                    ],
                    "member_count": 6
                },
                
             
            ],
            "ageBandTableType": null
        }
    ],
} 
}


// use this extraccted data and crete three tables for each category

// first column of each row contain age, then two columns for Employee which contain male and female, then two columns are of  Dependents male and female, and last column is of matrnity 

// first table contain count of male and female which takes maleCount and femaleCount respectively for both Employee and Dependent and last column contain maternityCount

// second table contain gross premium of male and female which takes maleGrossPremium and femaleGrossPremium respectively for both Employee and Dependent and last column contain maternityGrossPremium

// third table contain total gross premium of male and female which takes maleTotalGrossPremium and femaleTotalGrossPremium respectively for both Employee and Dependent and last column contain maternityTotalGrossPremium


// create code to for table, using npm docx, take input data as extracted data mentioned in above response