/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js"
import '@testing-library/jest-dom/extend-expect'
import NewBill from "../containers/NewBill.js"
import { fireEvent } from '@testing-library/dom'
import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js"
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes.js";

// test d'intégration POST
describe("Given I am a user connected as an employee", () => {
  describe("When I am on newBill Page and I have sent the form", () => {
    test("Then it should create a new bill", async () => {
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a", status: "connected", }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const dataCreated = jest.spyOn(mockStore.bills(), "create");
      const bill = {
        name: "Facture",
        date: "2023-09-19",
        type: "Vol",
        amount: 150,
        pct: 20,
        vat: "30",
        fileName: "test.jpg",
        fileUrl: "https://test.jpg",
        commentary: "Test bill",
      };
      await mockStore.bills().create(bill);

      expect(dataCreated).toHaveBeenCalled();
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", { value: localStorageMock });
        window.localStorage.setItem("user", JSON.stringify({
          type: "Employee",
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })

      test("Then sends new bill to the API and fails with 404 message error", async () => {
        const error = new Error("Erreur 404");
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.NewBill);
        await new Promise(process.nextTick);
        await expect(mockStore.bills().create({})).rejects.toEqual(error);
      });

      test("Then sends new bill to the API and fails with 500 message error", async () => {
        const error = new Error("Erreur 500");
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.NewBill);
        await new Promise(process.nextTick);
        await expect(mockStore.bills().create({})).rejects.toEqual(error);
      });

    });
  });
});

describe('handleChangeFile Unit Test', () => {

  beforeEach(() => {
    const html = NewBillUI()
    document.body.innerHTML = html

    const user = {
      "type": "employee",
      "email": "a@a"
    };
    localStorage.setItem("user", JSON.stringify(user));
  })

  const store = {
    bills: jest.fn(() => ({
      create: jest.fn(() => Promise.resolve({ fileUrl: 'http://test.com', key: '12345' })),
      update: jest.fn(() => Promise.resolve())
    }))
  };

  test('should create a new bill for files with valid extensions', async () => {
    // Create a mock function with jest.fn() method
    const onNavigate = jest.fn()
    const newBillInstance = new NewBill({ document, onNavigate, store })
    const fileInput = newBillInstance.document.querySelector('input[data-testid="file"]')
    fireEvent.change(fileInput, {
      target: {
        files: [new File(['test file content'], 'test.jpg', { type: 'image/jpeg' })]
      }
    });
    const fileUrl = await newBillInstance.store.bills().create();
    expect(fileUrl).toBeDefined();
  })
})

describe('handleSubmit Unit Test', () => {
  test('should switch on bills page', async () => {
    // Create a mock function with jest.fn() method
    const onNavigate = jest.fn()
    const newBillInstance = new NewBill({ document, onNavigate })
    const e = {
      target: {
        querySelector: jest.fn().mockReturnValue({ value: 'test' })
      },
      preventDefault: jest.fn()
    };
    newBillInstance.handleSubmit(e)
    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])
  })
})