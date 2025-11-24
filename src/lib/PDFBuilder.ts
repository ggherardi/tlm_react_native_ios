import { Utility } from './Utility';
import { Bootstrap } from './Bootstrap';
import { BusinessEvent } from './models/BusinessEvent';
import { ExpenseReport } from './models/ExpenseReport';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Constants } from './Constants';
import dataContext from './models/DataContext';
import { Images } from '../assets/Images';
import { FileManager } from './FileManager';

export const PDFBuilder = {
  createExpensesPdfAsync: async (event: BusinessEvent, fileName: string): Promise<RNHTMLtoPDF.Pdf> => {
    return new Promise(async (resolve, reject) => {
      try {
        const directory = `Documents`;
        console.log(`Creating pdf in directory: `, directory);
        const expenses = Utility.GetExpensesForEvent(event);
        const generatedHtml = await PDFBuilder.generateHtml(event, expenses);
        const options = {
          html: generatedHtml,
          fileName: fileName,
          directory: directory,
        };
        let file = await RNHTMLtoPDF.convert(options).catch(e => console.log("Error while creating pdf: ", e));
        if (file) {
          console.log(`File created: `, file.filePath);
          resolve(file);
        } else {
          reject(undefined);
        }
      }
      catch (ex) {
        console.log(ex);
      }
    });
  },

  generateHtml: async (event: BusinessEvent, expenses: ExpenseReport[]): Promise<string> => {
    return new Promise<string>(async (resolve, reject) => {
      const documentDir = await FileManager.getDocumentDir();
      const userProfile = Utility.GetUserProfile();
      let travelledKmsRefund = 0;
      const refundExpense = ExpenseReport.generateKmRefund(event);
      if (refundExpense.name == Constants.Generic.TravelRefundExpenseName) {
        expenses.push(refundExpense);
      }
      Utility.SortByDate(expenses, 'date', false);
      const totalAmount: number = Utility.CalculateTotalAmount(expenses, 'amount')
      let html = `
      <style>
        ${Bootstrap.style}
        body { margin: 0; padding: 0; }

        .page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
        }

        .page.break-after {
          page-break-after: always;
        }

        /* Per-page watermark (receipts pages) */
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-25deg);
          width: 80%;
          opacity: 0.08;
          z-index: 0;
          pointer-events: none;
        }

        /* Keep regular content above the watermark */
        .content {
          position: relative;
          z-index: 1;
        }
      
        .font-20 {
          font-size: 20px;
        }
        
        .bg-grey {
          background-color: #969696;
        }
  
        .tlm-image {
          max-width: 600px;
          max-heigth: 680px;
          align-self: center;
          justify-content: center;
        }
  
        @media print {
          .pagebreak { page-break-before: always; }
        }      
      </style>
      <div class="page break-after">
        <div class="content">            
        <img src='${Images.tlm_logo.base_64}' width="300" />
        <img class="watermark" src='${Images.tlm_logo.base_64}' />
        <h1 class="text-center mt-5">NOTA SPESE</h1>
        
        <div class="text-right pt-3">        
          <span>Data:</span>
          <span>${Utility.FormatDateDDMMYYYY(new Date().toString())}</span>
        </div>      
  
        <div class="mt-4 mb-5 row border border-dark p-3">
          <div class="col-6">
            <span>Gruppo:</span>
            <span class="font-weight-bold">${event.name}</span>
          </div>        
          <div class="col-6">
            <span>Date evento:</span>
            <span class="font-weight-bold">${Utility.FormatDateDDMMYYYY(event.startDate)} - ${Utility.FormatDateDDMMYYYY(event.endDate)}</span>
          </div>
        </div>
  
        <div class="my-5 row border-bottom">
          <div class="col-6">
            <span>Hostess/Tour Leader:</span>
            <span class="font-weight-bold">${userProfile.name} ${userProfile.surname}</span>
          </div>
          <div class="col-6">
            <span>Destinazione:</span>
            <span class="font-weight-bold">${event.city}</span>
          </div>
        </div>
  
        <div class="${event.needCarRefund ? '' : 'd-none'} border-bottom my-5">
          <div>
            <span>Località di partenza:</span>
            <span class="font-weight-bold">${event.refundStartingCity}</span>
          </div>
          <div>
            <span>Località di arrivo:</span>
            <span class="font-weight-bold">${event.refundArrivalCity}</span>
          </div>
          <div>
            <span>Totale KM percorsi:</span>
            <span class="font-weight-bold">${event.totalTravelledKms}</span>
          </div>
        </div>
      `;

      // Main expenses table with pagination
      const rowsPerPage = 16; // approx. rows per page before break
      let rowsOnPage = 0;

      const openTable = () => {
        html += `
        <table class="table">
          <thead>          
            <tr>
              <th>Data</th>
              <th>Tipo di spesa</th>
              <th>Note</th>
              <th class="text-right">Costo</th>
            </tr>
          </thead>
          <tbody>`;
      };

      const closeTable = () => {
        html += `
          </tbody>
        </table>`;
      };

      const openSummaryPage = (isFirst: boolean) => {
        const pageClass = isFirst ? 'page' : 'page break-after';
        html += `
      </div>
    </div>
    <div class="${pageClass}">
      <div class="content">`;
      };

      // Start first table on first page
      openTable();

      for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];
        // Add row
        html += `
            <tr>
              <td>${expense.date ? Utility.FormatDateDDMMYYYY(expense.date) : ''}</td>
              <td>${expense.name}</td>
              <td>${expense.description}</td>
              <td class="text-right">${expense.amount.toFixed(2)} ${event.mainCurrency.symbol}</td>
            </tr>`;
        rowsOnPage++;

        // If we hit the limit and there are more rows, break page
        const moreRows = i < expenses.length - 1;
        if (rowsOnPage >= rowsPerPage && moreRows) {
          closeTable();
          // open new page for summary continuation
          openSummaryPage(false);
          openTable();
          rowsOnPage = 0;
        }
      }

      // Totals row on last page
      html += `
            <tr>
              <td></td>
              <td></td>
              <td>
                <div class="py-3 font-20 font-weight-bold">
                  <span>TOTALE NOTA SPESE</span>
                </div>
              </td>
              <td>
                <div class="bg-warning py-3 font-20 font-weight-bold text-right pr-2">${totalAmount?.toFixed(2)} ${event.mainCurrency.symbol}</div>
              </td>
            </tr>`;
      closeTable();

      // Cash fund table
      html += `
        <div class="mt-5 row">
          <div class="col-6">
            <table class="table table-striped">
              <tbody>
                <tr>
                  <td>Totale nota spese</td>
                  <td class="text-right">${totalAmount?.toFixed(2)} ${event.mainCurrency.symbol}</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Fondo cassa ricevuto</td>
                  <td class="text-right">${event.cashFund && Number(event.cashFund).toFixed(2)} ${event.mainCurrency.symbol}</td>
                  <td>=</td>
                </tr>
                <tr class="border-bottom">
                  <td>Totale dovuto al Tour Leader</td>
                  <td class="text-right">${(totalAmount - Number(event.cashFund)).toFixed(2)} ${event.mainCurrency.symbol}</td>
                  <td />
                </tr>
              </tbody>
            </table>   
          </div>
        </div>`;

      html += `
        </div>
      </div>`;
      console.log(expenses);
      // GG: I remove the travel refund expense since it has no image
      expenses = expenses.filter(e => e.name != Constants.Generic.TravelRefundExpenseName);

      for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];
        const photoFilePath = `${documentDir}/${expense.photoFilePath}`;
        console.log(`Expense with name: ${expense.name}, with amount: ${expense.amount} has picture in location: ${photoFilePath}`)
        const encodedImage = await FileManager.encodeBase64(photoFilePath);

        const pageIndex = i % 4;
        const isRowStart = pageIndex % 2 === 0;
        const isRowEnd = pageIndex % 2 === 1 || i === expenses.length - 1;
        const isPageEnd = pageIndex === 3 || i === expenses.length - 1;
        const isLastPage = i + 4 >= expenses.length;

        if (pageIndex === 0) {
          // New page for receipts
          const pageClass = isLastPage ? 'page' : 'page break-after';
          html += `
        <div class="${pageClass}">
          <img class="watermark" src='${Images.tlm_logo.base_64}' />
          <div class="content">`;
        }

        if (isRowStart) {
          html += `
            <div class="row my-5">`;
        }

        html += `
              <div class="col-6 text-center">
                <span>Scontrino per la spesa:</span>
                <span>${expense.name} - ${Utility.FormatDateDDMMYYYY(expense.date)} - ${expense.amount} ${event.mainCurrency.symbol}</span>
                <div class="d-flex" style="height: 550px; justify-content: center;">
                  <img class="tlm-image mt-5" src="data:image/jpg;base64, ${encodedImage}" height="500">
                </div>              
              </div>`;

        if (isRowEnd) {
          html += `
            </div>`;
        }

        if (isPageEnd) {
          html += `
          </div>
        </div>`;
        }
      }
      resolve(html);
    })
  },
}
