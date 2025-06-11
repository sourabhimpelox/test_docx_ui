
generatePdf(data: any[]): void {
  const groupedData = this.groupBy(data, 'BENEFITS GROUP');
  const categoryKeys = this.getUniqueCategories(data);

  const content: any[] = [];

  for (const [groupName, rows] of Object.entries(groupedData)) {
    content.push({
      text: groupName,
      style: 'tableGroupTitle',
      margin: [0, 10, 0, 5],
    });

    const tableBody = [
      ['BENEFITS HEADERS', ...categoryKeys], // Header row
      ...rows.map(row => [
        row['BENEFITS HEADERS'],
        ...categoryKeys.map(key => row[key] || '')
      ])
    ];

    content.push({
      table: {
        headerRows: 1,
        widths: Array(tableBody[0].length).fill('*'),
        body: tableBody,
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    });
  }

  const docDefinition = {
    content,
    styles: {
      tableGroupTitle: {
        fontSize: 14,
        bold: true,
        color: '#1F9557',
      },
    },
    defaultStyle: {
      fontSize: 9,
    }
  };

  pdfMake.createPdf(docDefinition).download(`${this.CRN}.pdf`);
}