import assert from '../../support/pages/pageAssertions';
import { AccountPage } from '../../support/pages/page_objects/accountPage';
import { CheckoutPage } from '../../support/pages/page_objects/checkoutPage';
import { HeaderComponent } from '../../support/pages/page_objects/header';
import { HomePage } from '../../support/pages/page_objects/homePage';
import { LoginPage } from '../../support/pages/page_objects/loginPage';
import { ProductPage } from '../../support/pages/page_objects/productPage';
import rawBillingData from '../../fixtures/billingAddress.json';
import { BillingData } from '../../support/types/billingInfo';
import rawCreditCardData from '../../fixtures/creditCardInfo.json';
import { CreditCardInfo } from '../../support/types/creditCardInfo';
import userCredentials from '../../fixtures/userCredentials.json';
import aliasHelper from '../../support/helpers/aliasHelper';

const billingAddressData = rawBillingData as BillingData;
const creditCardData = rawCreditCardData as CreditCardInfo;
const customerUserEmail = userCredentials.customerUser.email;
const customerUserPassword = Cypress.env('CUSTOMERUSER_PASSWORD');
const { pageActions: header } = HeaderComponent();
const { pageActions: loginPage } = LoginPage();
const { pageActions: homePage } = HomePage();
const { pageActions: productPage } = ProductPage();
const { selectors: accountPageSelectors } = AccountPage();
const { pageActions: checkoutPage, selectors: checkoutPageSelectors } =
  CheckoutPage();

describe('Purchase Flow Tests', () => {
  it('Purchase Flow Happy Path', () => {
    homePage.visit();
    header.clickSignInButton();
    loginPage.loginUI(customerUserEmail, customerUserPassword);
    assert.elementIsVisible(accountPageSelectors.profileButton);
    header.clickLogo();
    homePage.searchForProduct('Pliers').clickOnProduct('Combination Pliers');
    productPage
      .clickIncreaseQuantityButton()
      .clickIncreaseQuantityButton()
      .clickAddToCartButton()
      .clickAddedToCartModal(); // click it so it doesn't cover the shoppingCartButton
    header.clickShoppingCartButton();
    checkoutPage
      .setQuantityForProduct('Combination Pliers', 1)
      .clickProceedToCheckoutButtonInStepOne()
      .clickProceedToCheckoutButtonInStepTwo()
      .fillBillingInfoForm(billingAddressData)
      .clickProceedToCheckoutButtonInStepThree()
      .selectPaymentMethod('Credit Card')
      .fillCreditCardInfoForm(creditCardData)
      .clickConfirmButton();
    assert.elementContainingTextIsVisible('Payment was successful');
    checkoutPage.clickConfirmButton();
    aliasHelper.saveInvoiceNumberInAliasFromSelector(
      checkoutPageSelectors.orderConfirmation,
    );
    cy.get('[data-test="nav-menu"]').click();
    cy.get('[data-test="nav-my-invoices"]').click();
    assert.aliasTextIsPresentInPage('invoiceNumber');
  });
});
