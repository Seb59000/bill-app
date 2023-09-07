/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

// Import the necessary functions and components
import { render } from '@testing-library/react';
// import { render, screen } from '@testing-library/react';
import BillsPage from '../BillsPage';
// Mock your bills data
// const bills = [
//   { id: 1, date: '2021-01-01' },
//   { id: 2, date: '2021-02-01' },
//   { id: 3, date: '2021-03-01' },
// ];

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      // expect(windowIcon).toHaveClass('active-icon')
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      // console.log('dates', dates)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      // console.log('datesSorted', datesSorted)
      // expect(dates).toEqual(datesSorted)
    })
  })
})
describe('BillsPage', () => {
  it('should display bills ordered from earliest to latest', () => {
    // Render the BillsPage component
    render(<BillsPage bills={bills} userRole="employee" />);

    // Get all the bill elements on the page
    const billElements = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)

    // Iterate over the bill elements to check the order
    for (let i = 0; i < billElements.length - 1; i++) {
      const currentBillDate = billElements[i].getAttribute('data-date');
      const nextBillDate = billElements[i + 1].getAttribute('data-date');

      // Ensure that the current bill date is earlier or equal to the next bill date
      expect(new Date(currentBillDate)).toBeLessThanOrEqual(new Date(nextBillDate));
    }
  });
});