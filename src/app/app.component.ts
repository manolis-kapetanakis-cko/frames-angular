import { Component } from '@angular/core';
import { CkoFrames } from 'frames-angular-beta';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frames-angular-lib';


  private Frames = undefined;
  private errors = {};
  public cardToken: string;
  public logos = {}

  constructor() {
    this.logos = generateLogos();
    function generateLogos() {
      const logos = {};
      logos["card-number"] = {
        src: "card",
        alt: "card number logo"
      };
      logos["expiry-date"] = {
        src: "exp-date",
        alt: "expiry date logo"
      };
      logos["cvv"] = {
        src: "cvv",
        alt: "cvv logo"
      };
      return logos;
    }

    this.errors["card-number"] = "Please enter a valid card number";
    this.errors["expiry-date"] = "Please enter a valid expiry date";
    this.errors["cvv"] = "Please enter a valid cvv code";
  }

  ngOnInit() {
    this.Frames = new CkoFrames({
      publicKey: 'pk_test_7d9921be-b71f-47fa-b996-29515831d911',
      debug: true,
      // localization: {
      //   cardNumberPlaceholder: "Card number",
      //   expiryMonthPlaceholder: "MM",
      //   expiryYearPlaceholder: "YY",
      //   cvvPlaceholder: "CVV",
      // },
      cardValidationChanged: this.onCardValidationChanged.bind(this),
      frameValidationChanged: this.onValidationChanged.bind(this),
      cardTokenizationFailed: this.onCardTokenizationFailed.bind(this),
      paymentMethodChanged: this.onPaymentMethodChanged.bind(this)
    });
    this.Frames.init();
  }

  //FRAME_VALIDATION_CHANGED
  onValidationChanged(event) {
    console.log("FRAME_VALIDATION_CHANGED: %o", event);

    const e = event.element;
    if (event.isValid || event.isEmpty) {
      if (e == "card-number" && !event.isEmpty) {
        this.showPaymentMethodIcon(null, null);
      }
      this.setDefaultIcon(e);
      this.clearErrorIcon(e);
      this.clearErrorMessage(e);
    } else {
      if (e == "card-number") {
        this.clearPaymentMethodIcon(null);
      }
      this.setDefaultErrorIcon(e);
      this.setErrorIcon(e);
      this.setErrorMessage(e);
    }
  }

  clearErrorMessage(el) {
    const selector = ".error-message__" + el;
    const message = <HTMLInputElement>document.querySelector(selector);
    message.textContent = "";
  }

  clearErrorIcon(el) {
    const logo = <HTMLInputElement>document.getElementById("icon-" + el + "-error");

  }

  showPaymentMethodIcon(parent, pm) {
    if (parent) parent.classList.add("show");

    // const logo = <HTMLInputElement>document.getElementById("logo-payment-method");
    if (pm) {
      const name = pm.toLowerCase();
      // logo.setAttribute("src", "assets/card-icons/" + name + ".svg");
      // logo.setAttribute("alt", pm || "payment method");
    }

  }

  clearPaymentMethodIcon(parent) {
    if (parent) parent.classList.remove("show");
    // const logo = <HTMLInputElement>document.getElementById("logo-payment-method");
    // logo.style.setProperty("display", "none");
  }

  setErrorMessage(el) {
    const selector = ".error-message__" + el;
    const message = <HTMLInputElement>document.querySelector(selector);
    message.textContent = this.errors[el];
  }

  setDefaultIcon(el) {
    const selector = "icon-" + el;
    const logo = <HTMLInputElement>document.getElementById(selector);
    // logo.setAttribute("src", "assets/card-icons/" + this.logos[el].src + ".svg");
    // logo.setAttribute("alt", this.logos[el].alt);
  }

  setDefaultErrorIcon(el) {
    const selector = "icon-" + el;
    const logo = <HTMLInputElement>document.getElementById(selector);
    // logo.setAttribute("src", "assets/card-icons/" + this.logos[el].src + "-error.svg");
    // logo.setAttribute("alt", this.logos[el].alt);
  }

  setErrorIcon(el) {
    const logo = <HTMLInputElement>document.getElementById("icon-" + el + "-error");
    // logo.style.setProperty("display", "block");
  }

  //CARD_VALIDATION_CHANGED
  onCardValidationChanged(event) {
    const button = <HTMLInputElement>document.getElementById('pay-button');
    const errorMessage = <HTMLInputElement>document.querySelector(".error-message");
    console.log("CARD_VALIDATION_CHANGED: %o", event);
    button.disabled = !this.Frames.getFrames().isCardValid();
    if (!this.Frames.getFrames().isCardValid()) {
      errorMessage.textContent = this.getErrorMessage(event);
    }
  }

  getErrorMessage(event) {
    if (event.isValid || event.isEmpty) {
      return '';
    }
    return this.errors[event.element];
  }

  //CARD_TOKENIZATION_FAILED
  onCardTokenizationFailed(error) {
    console.log("CARD_TOKENIZATION_FAILED: %o", error);
    this.Frames.enableSubmitForm();
  }

  async submitCard() {
    let payload = await this.Frames.getTokenisedCard();
    this.cardToken = 'The card token: ' + payload.token;
  }

  //PAYMENT_METHOD_CHANGED
  onPaymentMethodChanged(event) {
    console.log("PAYMENT_METHOD_CHANGED: %o", event);
    var pm = event.paymentMethod;
    let container = <HTMLInputElement>document.querySelector(".icon-container.payment-method");

    if (!pm) {
      this.clearPaymentMethodIcon(container);
    } else {
      this.clearErrorIcon("card-number");
      this.showPaymentMethodIcon(container, pm);
    }
  }
}
