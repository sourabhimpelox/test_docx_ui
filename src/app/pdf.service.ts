import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  formMandatoryBenefits(quote: any[]) {
    let uniqueMandatoryBenefitHeaders = [];

    quote.map((category) => {
      category.data.mandatory_benefits.map((benefit, index) => {
        uniqueMandatoryBenefitHeaders.push({ index: index, group: benefit.group_details, header: benefit.tob_header.trim() });
      });
    });

    const sortedMandatoryBenefitHeader = _.sortBy(uniqueMandatoryBenefitHeaders, (obj) => obj.index);
    const uniqueMandatorySortedBenefitHeaders = _.uniqBy(sortedMandatoryBenefitHeader, 'header');
    let uniqueMandatoryBenefitGroup = [...new Set(uniqueMandatorySortedBenefitHeaders.map((obj) => obj.group))];

    let orderedMandatoryGroupsHeaders = [];
    uniqueMandatoryBenefitGroup.map((benefitGroup) => {
      let matchedGroups = uniqueMandatorySortedBenefitHeaders.filter((uniqueHeader) =>
        uniqueHeader.group.trim().toLowerCase() === benefitGroup.trim().toLowerCase()
      );
      orderedMandatoryGroupsHeaders.push(...matchedGroups);
    });

    return orderedMandatoryGroupsHeaders;
  }

  formOptionalBenefits(quote: any[]) {
    let uniqueOptionalBenefitHeaders = [];

    quote.map((category) => {
      if (category.data.optional_benefits) {
        category.data.optional_benefits.map((benefit, index) => {
          uniqueOptionalBenefitHeaders.push({ index: index, group: benefit.group_details, header: benefit.tob_header });
        });
      }
    });

    if (uniqueOptionalBenefitHeaders.length > 0) {
      const sortedOptionalBenefitHeader = _.sortBy(uniqueOptionalBenefitHeaders, (obj) => obj.index);
      const uniqueOptionalSortedBenefitHeaders = _.uniqBy(sortedOptionalBenefitHeader, 'header');
      let uniqueOptionalBenefitGroup = [...new Set(uniqueOptionalSortedBenefitHeaders.map((obj) => obj.group))];

      let orderedOptionalGroupsHeaders = [];
      uniqueOptionalBenefitGroup.map((benefitGroup) => {
        let matchedGroups = uniqueOptionalSortedBenefitHeaders.filter((uniqueHeader) =>
          uniqueHeader.group.trim().toLowerCase() === benefitGroup.trim().toLowerCase()
        );
        orderedOptionalGroupsHeaders.push(...matchedGroups);
      });

      return orderedOptionalGroupsHeaders;
    } else {
      return [];
    }
  }

  formMandatoryBenefitsTable(orderedMandatoryGroupsHeaders, quote, benefitOptions, insurerURL) {
    orderedMandatoryGroupsHeaders.map((uniqueBenefit, index) => {
      let rows = [];
      let columns: { text?: any; color?: string; fillColor?: string }[] =
        insurerURL !== 'nlgi' && (insurerURL == 'dnic' || insurerURL == 'dni')
          ? [{ text: uniqueBenefit.header, color: '#FFFFFF' }]
          : [{ text: uniqueBenefit.header }];
      if (insurerURL === 'nlgi') {
        columns = [{ text: uniqueBenefit.header, fillColor: index % 2 ? '#ffffff' : '#eeeeee' }];
      }
      if (insurerURL === 'fidelity' || insurerURL == 'allianz-test') {
        columns = [{ text: uniqueBenefit.header, fillColor: '#7774B5', color: '#FFFFFF' }];
      }
      quote.map((category) => {
        const matchedBenefitValue = this.getBenefitValueByCategoryMandatoryBenefitHeader(uniqueBenefit, category);

        if (insurerURL === 'nlgi') {
          columns.push({ text: matchedBenefitValue.tob_value, fillColor: index % 2 ? '#ffffff' : '#eeeeee' });
        } else if (insurerURL === 'fidelity' || insurerURL == 'allianz-test') {
          columns.push({ text: matchedBenefitValue.tob_value, color: '#37528A' });
        } else {
          columns.push({ text: matchedBenefitValue.tob_value });
        }

        if (rows.filter((row) => row.text === matchedBenefitValue.group)?.length <= 0) {
          if (insurerURL == 'aiaw') {
            rows.push(
              { text: matchedBenefitValue.group, fillColor: '#CDCFCF', colSpan: quote.length + 1, color: '#001791', bold: true },
              ...quote.map(() => ({}))
            );
          } else if (insurerURL == 'newton') {
            rows.push(
              { text: matchedBenefitValue.group, colSpan: quote.length + 1, bold: true },
              ...quote.map(() => ({}))
            );
          } else if (insurerURL == 'fidelity' || insurerURL == 'allianz-test') {
            rows.push(
              { text: matchedBenefitValue.group, fillColor: '#7774B5', colSpan: quote.length + 1, color: '#FFFFFF', bold: true },
              ...quote.map(() => ({}))
            );
          } else {
            rows.push(
              insurerURL == 'dnic' || insurerURL == 'dni'
                ? { text: matchedBenefitValue.group, bold: true, fillColor: '#B4E0DB', colSpan: quote.length + 1 }
                : insurerURL == 'nlgi'
                  ? { text: matchedBenefitValue.group, style: ['categoryTitle'], alignment: 'center', colSpan: quote.length + 1 }
                  : { text: matchedBenefitValue.group, style: ['categoryTitle'], colSpan: quote.length + 1 },
              ...quote.map(() => ({}))
            );
          }
        }
      });

      benefitOptions.table.body.push(rows);
      benefitOptions.table.body.push(columns);
    });

    return benefitOptions.table.body;
  }

  formOptionalBenefitsTable(orderedOptionalGroupsHeaders, quote, benefitOptions, insurerURL) {
    orderedOptionalGroupsHeaders.map((uniqueBenefit, index) => {
      let rows = [];
      let columns: { text?: any; color?: string; fillColor?: string }[] =
        insurerURL !== 'nlgi' && (insurerURL == 'dnic' || insurerURL == 'dni')
          ? [{ text: uniqueBenefit.header, color: '#FFFFFF' }]
          : [{ text: uniqueBenefit.header }];
      if (insurerURL === 'nlgi') {
        columns = [{ text: uniqueBenefit.header, fillColor: index % 2 ? '#ffffff' : '#eeeeee' }];
      }
      quote.map((category) => {
        const matchedBenefitValue = this.getBenefitValueByCategoryOptionalBenefitHeader(uniqueBenefit, category);

        if (insurerURL === 'nlgi') {
          columns.push({ text: matchedBenefitValue.tob_value, fillColor: index % 2 ? '#ffffff' : '#eeeeee' });
        } else {
          columns.push({ text: matchedBenefitValue.tob_value });
        }

        if (rows.filter((row) => row.text === matchedBenefitValue.group)?.length <= 0) {
          if (insurerURL == 'fidelity' || insurerURL == 'allianz-test') {
            rows.push(
              { text: matchedBenefitValue.group, fillColor: '#7774B5', colSpan: quote.length + 1, color: '#FFFFFF', bold: true },
              ...quote.map(() => ({}))
            );
          } else {
            rows.push(
              insurerURL == 'dnic' || insurerURL == 'dni'
                ? { text: matchedBenefitValue.group, bold: true, fillColor: '#B4E0DB', colSpan: quote.length + 1 }
                : { text: matchedBenefitValue.group, style: ['categoryTitle'], colSpan: quote.length + 1 },
              ...quote.map(() => ({}))
            );
          }
        }
      });

      benefitOptions.table.body.push(rows);
      benefitOptions.table.body.push(columns);
    });
    return benefitOptions.table.body;
  }

  removeDuplicateBenefitGroupdetails(benefitOptions) {
    function removeDuplicates(arr: any[][]): any[][] {
      const uniqueArray = arr.filter((value, index, self) => index === self.findIndex((arrItem) => JSON.stringify(arrItem) === JSON.stringify(value)));
      return uniqueArray;
    }

    benefitOptions = removeDuplicates(benefitOptions);
    return benefitOptions;
  }

  getBenefitValueByCategoryMandatoryBenefitHeader(header, category) {
    const benefit = category.data.mandatory_benefits.find((b) => b.tob_header.trim() === header.header.trim());
    return benefit || { tob_value: '', group: header.group };
  }

  getBenefitValueByCategoryOptionalBenefitHeader(header, category) {
    const benefit = category.data.optional_benefits?.find((b) => b.tob_header.trim() === header.header.trim());
    return benefit || { tob_value: '', group: header.group };
  }
}
