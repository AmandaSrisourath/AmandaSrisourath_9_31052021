import { screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills";
import { bills } from "../fixtures/bills.js"
import Router from "../app/Router";
import firestore from "../app/Firestore"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import firebase from "../__mocks__/firebase";
import DashboardUI from "../views/DashboardUI";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const user = {
        type: "Employee",
      };
      localStorage.setItem('user', JSON.stringify(user));

      const rootDiv = document.createElement("div");
      rootDiv.id = "root";
      document.body.appendChild(rootDiv);

      // mock firestore bills method
      firestore.bills = () => ({bills, get: jest.fn().mockResolvedValue()});

      // define window.location.hash to Bills url
      Object.defineProperty(window, 'location', { value:{
          hash: ROUTES_PATH['Bills']
        }  });

      Router();

      const iconWindow = screen.getByTestId("icon-window");
      expect(iconWindow.classList.contains('active-icon')).toBe(true);
    })

    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Then I click on new bill button and newBill page should be open", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;

      // mock onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      new Bills({document, onNavigate, firestore, localStorage });
      const buttonNewBill = screen.getByTestId("btn-new-bill");
      userEvent.click(buttonNewBill);
      expect(screen.queryByTestId('form-new-bill')).toBeTruthy();
    })

    test("Then I click on iconEye and a modal should be open", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;

      // mock bootstrap modal method
      $.fn.modal = jest.fn();
      new Bills({document, onNavigate: null, firestore, localStorage });

      const iconEye = screen.getAllByTestId("icon-eye")[0];
      userEvent.click(iconEye);
      expect($.fn.modal).toHaveBeenCalled();
    })
  })
})

// integration test GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to bills page", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(firebase, "get")
      const bills = await firebase.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 404"))
      )
      const html = DashboardUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 500"))
      )
      const html = DashboardUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})