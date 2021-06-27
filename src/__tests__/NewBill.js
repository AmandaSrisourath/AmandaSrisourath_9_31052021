import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import Bills from "../containers/Bills";
import firestore from "../app/Firestore";
import {ROUTES} from "../constants/routes";

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
      fireEvent.change(input, { target: { files: [file] } })

      expect(input.files[0].name).toBe(file.name);
    })
  })
})