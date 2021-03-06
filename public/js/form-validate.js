var FormValidate = function () {
  "use strict";

  function Construct(params) {
    if (!(this instanceof Construct)) {
      return new Construct(params);
    }

    this.init.apply(this, params);
  }

  Construct.prototype = Object.create(ReasanikBase());

  // Construct.prototype = {

  Construct.prototype.constructor = Construct;

  Construct.prototype.pluginName = "FormValidate";

  Construct.prototype.init = function (params) {
    var self = this;

    params = this.extend(
      {
        formID: false,
        onlySubmitChecking: false,
      },
      params,
    );

    if (!params.formID) {
      this.setErrorMessage(this.pluginName);
      return false;
    }

    this.formID = params.formID;

    var onlySubmitChecking = params.onlySubmitChecking;

    params = null;

    this.errorMessage = false;
    this.errorMessageID = "contacts-form-error";
    this.errorMessageElem = document.getElementById(this.errorMessageID);

    var elems = document.querySelectorAll("#" + this.formID + " .form-elem--required");

    if (!onlySubmitChecking) {
      for (var i = 0, len = elems.length; i < len; i++) {
        elems[i].addEventListener("blur", function () {
          self.validate(this);
        });
      }
    }

    document.getElementById(this.formID).addEventListener("submit", function (event) {
      event.preventDefault();

      for (var i = 0, len = elems.length; i < len; i++) {
        if (!self.validate(elems[i])) {
          return;
        }
      }

      this.submit();
    });
  };

  Construct.prototype.validate = function (elem) {
    var tag = elem.tagName.toLowerCase();
    var type;

    this.errorMessage = false;

    switch (tag) {
      case "select":
        type = tag;
        break;
      default:
        type = elem.getAttribute("type") || "text";
    }

    switch (type) {
      case "select":
        validateSelect(elem);
        break;
      case "text":
        if (elem.name == this.formID + "_website") {
          this.validateWebAdress(elem);
        } else {
          this.validateText(elem);
        }
        break;
      case "email":
        this.validateEmail(elem);
        break;
      case "password":
        validatePassword(elem);
        break;
    }
    console.log(this.errorMessage);
    document.querySelector("#" + this.errorMessageID + " div").innerHTML = this.errorMessage;

    if (this.errorMessage) {
      this.errorMessageElem.style.top = elem.offsetTop + 100 + "px";
      this.errorMessageElem.classList.add("active");
      return false;
    }

    this.errorMessageElem.style.top = "";
    this.errorMessageElem.classList.remove("active");

    return true;
  };

  Construct.prototype.trim = function (str) {
    var trimmingChar = " ";
    var firstRestIndex;
    var i;
    var len = str.length;

    for (i = 0; i < len; i++) {
      if (str[i] != trimmingChar) {
        break;
      }
    }

    str = str.slice(i, len);
    len = str.length;

    if (str.lastIndexOf(trimmingChar) == len - 1);
    {
      for (i = len - 1; i >= 0; i--) {
        if (str[i] != trimmingChar) {
          break;
        }
      }
    }

    str = str.slice(0, i + 1);

    return str;
  };

  Construct.prototype.validateText = function (elem) {
    var str = elem.value;
    var reg = /^[a-z0-9 ]+$/;

    str = this.trim(str);

    elem.value = str;
    console.log(!str);
    if (!str) {
      this.errorMessage = "Пустое поле!";
      return false;
    }

    if (!this.checkByRegExp(str, reg)) {
      this.errorMessage = "В поле введён недопустимый символ!";
      return false;
    }

    elem.value = str;
  };

  Construct.prototype.validateEmail = function (elem) {
    var parts = elem.value.split("@");
    var len = parts.length;
    var address;
    var domain;
    var domainParts;
    var regAdr = /^[a-z0-9_-]{3,}$/i;

    if (len < 2) {
      this.errorMessage = "Нет символа @!";
      return false;
    }

    if (len > 3) {
      this.errorMessage = "Символ @ должен быть только один!";
      return false;
    }

    address = this.trim(parts[0]);
    domain = parts[1];

    elem.value = address + "@" + domain;

    if (!address) {
      this.errorMessage = "Не заполнен адрес почты!";
      return false;
    }

    if (!this.checkByRegExp(address, regAdr)) {
      this.errorMessage = "В адресе почты есть недопустимые символы!";
      return false;
    }

    domain = this.domainCheck(domain);

    if (!domain) {
      return false;
    }

    elem.value = address + "@" + domain;
  };

  Construct.prototype.validateWebAdress = function (elem) {
    var parts = elem.value.split(".", 2);
    var len = parts.length;
    var address;
    var domain;
    var domainParts;
    var regAdr = /^[a-z0-9_-]{3,}$/i;

    if (len < 2) {
      this.errorMessage = "Нет точки!";
      return false;
    }

    address = this.trim(parts[0]);
    domain = parts[1];

    elem.value = address + "." + domain;

    if (!address) {
      this.errorMessage = "Не заполнен адрес сайта!";
      return false;
    }

    if (!this.checkByRegExp(address, regAdr)) {
      this.errorMessage = "В адресе сайта есть недопустимые символы!";
      return false;
    }

    domain = this.domainCheck(domain, true);

    if (!domain) {
      return false;
    }

    elem.value = address + "." + domain;
  };

  Construct.prototype.domainCheck = function (str, notForEmail) {
    var domainParts = str.split(".");
    var len = domainParts.length;
    var minParts = 2;
    var regDom = /^[a-z]{2,}$/;

    notForEmail = notForEmail || false;

    if (notForEmail) {
      minParts = 1;
    }

    if (len < minParts) {
      this.errorMessage = "В домене должна быть как минимум одна точка!";
      return false;
    }

    for (var i = 0; i < len; i++) {
      domainParts[i] = this.trim(domainParts[i]);

      if (!domainParts[i]) {
        this.errorMessage = "Не заполнена одна из частей домена!";
        return false;
      }

      if (!this.checkByRegExp(domainParts[i], regDom, true)) {
        this.errorMessage = "В домене есть недопустимые символы!";
        return false;
      }
    }

    return domainParts.join(".");
  };

  Construct.prototype.checkByRegExp = function (str, regExp, caseSensetive) {
    caseSensetive = caseSensetive || false;

    if (!caseSensetive) {
      str = str.toLowerCase();
    }

    if (str.search(regExp) === -1) {
      return false;
    }

    return true;
  };

  Construct.prototype.hideErrorMessage = function () {
    this.errorMessageElem.style.top = "";
    this.errorMessageElem.classList.remove("active");
  };
  // };

  return Construct(arguments);
};
