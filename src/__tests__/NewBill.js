import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import Bills from "../containers/Bills";
import { bills } from "../fixtures/bills.js"
import firestore from "../app/Firestore";
import {ROUTES} from "../constants/routes";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and I fill the form", () => {
    test("Then I can add a file to NewBill Form", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      new NewBill({document, onNavigate, firestore, localStorage});

      const file = new File(['hello'], 'hello.png', { type: 'image/png' });
      const input = screen.queryByTestId("file");
      fireEvent.change(input, { target: { files: [file] } });

      expect(input.files[0].name).toBe(file.name);
    })

    test("Then I can create a new bill", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname, data: bills });
      }
      firestore.bills = () => ({
        bills,
        get: jest.fn().mockResolvedValue(),
        add: (bill) => {
          bills.push(bill);
          return Promise.resolve();
        },
      })

      new NewBill({document, onNavigate, firestore, localStorage});

      const user = {
        type: "Employee",
        email: "johndoe@email.com",
      };
      localStorage.setItem('user', JSON.stringify(user));

      document.querySelector(`select[data-testid="expense-type"]`).value = "Restaurants et bars";
      document.querySelector(`input[data-testid="expense-name"]`).value = "The Goldy";
      document.querySelector(`input[data-testid="amount"]`).value = "30$";
      document.querySelector(`input[data-testid="datepicker"]`).value = "08/07/2021";
      document.querySelector(`input[data-testid="vat"]`).value = "70";
      document.querySelector(`input[data-testid="pct"]`).value = "20";
      document.querySelector(`textarea[data-testid="commentary"]`).value = "Bon app";

      const btnSendBill = document.querySelector("#btn-send-bill");
      userEvent.click(btnSendBill);

      expect(screen.queryByText('The Goldy')).toBeTruthy();
      expect(screen.queryByText('Mes notes de frais')).toBeTruthy();
    })
  })
})