const xml = require('jstoxml');
const req = require('request');

class pagseguro {

  constructor() {

    this.email = configObj.email;
    this.token = configObj.token;
    this.mode = configObj.mode || "payment";

    if (configObj.sandbox) {
      this.uri = "https://ws.sandbox.pagseguro.uol.com.br/";
    } else {
      this.uri = "https://ws.pagseguro.uol.com.br/";
    }

    this.version = 'v2';

    this.obj = {};
    this.xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    return;

  }

  setCurrency(cur) {
    this.obj.currency = cur;
    return;
  }

  setReference(ref) {
    this.obj.reference = ref;
    return;
  }

  addItem(item) {

    if (this.mode === 'subscription') {
      throw new Error("This function is for payment mode only!");
    }

    if (this.obj.items == null) {
      this.obj.items = [];
    }

    this.obj.items.push({
      item: item
    });

    return;

  }

  setBuyer(buyer) {

    this.obj.sender = {
      name: buyer.name,
      email: buyer.email,
      phone: {
        areaCode: buyer.phoneAreaCode,
        number: buyer.phoneNumber
      }
    };

    if (this.mode === 'subscription') {
      this.obj.sender.address = {};
      if (buyer.street != null) {
        this.obj.sender.address.street = buyer.street;
      }
      if (buyer.number != null) {
        this.obj.sender.address.number = buyer.number;
      }
      if (buyer.postalCode != null) {
        this.obj.sender.address.postalCode = buyer.postalCode;
      }
      if (buyer.city != null) {
        this.obj.sender.address.city = buyer.city;
      }
      if (buyer.state != null) {
        this.obj.sender.address.state = buyer.state;
      }
      if (buyer.country != null) {
        this.obj.sender.address.country = buyer.country;
      }
      if (buyer.complement != null) {
        this.obj.sender.address.complement = buyer.complement;
      }
      if (buyer.district != null) {
        this.obj.sender.address.district = buyer.district;
      }
    }

  }

  setShipping(shippingInfo) {

    switch (this.mode) {
      case 'payment':
        this.obj.shipping = {
          type: shippingInfo.type,
          address: {
            street: shippingInfo.street,
            number: shippingInfo.number,
            postalCode: shippingInfo.postalCode,
            city: shippingInfo.city,
            state: shippingInfo.state,
            country: shippingInfo.country
          }
        };
        if (shippingInfo.complement != null) {
          this.obj.shipping.complement = shippingInfo.complement;
        }
        if (shippingInfo.district != null) {
          this.obj.shipping.district = shippingInfo.district;
        }
        break;
      case 'subscription':
        if (this.obj.sender == null) {
          this.obj.sender = {};
        }
        this.obj.sender.address = {
          street: shippingInfo.street,
          number: shippingInfo.number,
          postalCode: shippingInfo.postalCode,
          city: shippingInfo.city,
          state: shippingInfo.state,
          country: shippingInfo.country
        };
        if (shippingInfo.complement != null) {
          this.obj.sender.address.complement = shippingInfo.complement;
        }
        if (shippingInfo.district != null) {
          this.obj.sender.address.district = shippingInfo.district;
        }
    }

    return;

  }

  setPreApproval(preApprovalInfo) {

    var maxTotalAmount, twoYearsFromNow;

    if (this.mode === 'subscription') {

      twoYearsFromNow = new Date();
      twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
      maxTotalAmount = preApprovalInfo.maxTotalAmount * 1 || preApprovalInfo.amountPerPayment * 24 || preApprovalInfo.maxAmountPerPayment * 24;

      this.obj.preApproval = {
        charge: preApprovalInfo.charge || 'manual',
        finalDate: preApprovalInfo.finalDate || twoYearsFromNow.toJSON(),
        maxTotalAmount: maxTotalAmount.toFixed(2)
      };

      if (preApprovalInfo.name != null) {
        this.obj.preApproval.name = preApprovalInfo.name;
      }
      if (preApprovalInfo.details != null) {
        this.obj.preApproval.details = preApprovalInfo.details;
      }
      if (preApprovalInfo.period != null) {
        this.obj.preApproval.period = preApprovalInfo.period;
      }
      if (preApprovalInfo.amountPerPayment != null) {
        this.obj.preApproval.amountPerPayment = preApprovalInfo.amountPerPayment;
      }
      if (preApprovalInfo.maxAmountPerPayment != null) {
        this.obj.preApproval.maxAmountPerPayment = preApprovalInfo.maxAmountPerPayment;
      }
      if (preApprovalInfo.maxPaymentsPerPeriod != null) {
        this.obj.preApproval.maxPaymentsPerPeriod = preApprovalInfo.maxPaymentsPerPeriod;
      }
      if (preApprovalInfo.maxAmountPerPeriod != null) {
        this.obj.preApproval.maxAmountPerPeriod = preApprovalInfo.maxAmountPerPeriod;
      }
      if (preApprovalInfo.initialDate != null) {
        this.obj.preApproval.initialDate = preApprovalInfo.initialDate;
      }
    } else {
      throw new Error("This function is for subscription mode only!");
    }

    return;

  }

  /*
  Configura as URLs de retorno e de notificação por pagamento
   */
  setRedirectURL(url) {
    this.obj.redirectURL = url;
    return;
  }

  setNotificationURL(url) {
    this.obj.notificationURL = url;
    return;
  }

  setReviewURL(url) {
    if (this.mode === "subscription") {
      this.obj.reviewURL = url;
    } else {
      throw new Error("This function is for subscription mode only!");
    }
    return;
  }

  send() {

    var options;
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8'
      }
    };

    switch (this.mode) {
      case 'payment':
        options.uri = this.uri + this.version + "/checkout?email=" + this.email + "&token=" + this.token;
        options.body = this.xml + xml.toXML({
          checkout: this.obj
        });
        break;
      case 'subscription':
        options.uri = this.uri + this.version + "/pre-approvals/request?email=" + this.email + "&token=" + this.token;
        options.body = this.xml + xml.toXML({
          preApprovalRequest: this.obj
        });
        break;
    }

    return new Promise(
      function (resolve, reject) {

        req(options, function (err, res, body) {

          if (err) {
            reject(err);
          } else {
            resolve(body);
          }

        });

      }
    );

  }

  createTransfer(data) {

    var options;
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.pagseguro.com.br.v1+json'
      }
    };

    options.uri = this.uri + "transfer/authorize?email=" + this.email + "&token=" + this.token;
    options.body = JSON.stringify({
      "receiverEmail": data.receiverEmail,
      "amount": data.amount,
      "description": data.description
    });

    return new Promise(
      function (resolve, reject) {

        req(options, function (err, res, body) {

          if (err) {
            reject(err);
          } else {
            resolve(body);
          }

        });

      }
    );

  }

  authorizeTransfer(code) {

    var options;
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.pagseguro.com.br.v1+json'
      }
    };

    options.uri = this.uri + "transfer/authorize?email=" + this.email + "&token=" + this.token;
    options.body = JSON.stringify({
      "authorizationCode": code
    });

    return new Promise(
      function (resolve, reject) {

        req(options, function (err, res, body) {

          if (err) {
            reject(err);
          } else {
            resolve(body);
          }

        });

      }
    );

  }

  getBalance() {

    var uri = this.uri + "transfer/balance?email=" + this.email + "&token=" + this.token;

    return new Promise(
      function (resolve, reject) {

        req({
          method: 'GET',
          headers: {
            'Content-Type': 'application/vnd.pagseguro.com.br.v1+json'
          },
          uri: uri

        }, function (error, response, body) {

          if (error) {
            reject(error);

          } else {
            resolve(body);
          }

        });

      });

  }

  getTransaction(code) {

    var uri = this.uri + this.version + "/transactions/" + code + "?email=" + this.email + "&token=" + this.token;

    return new Promise(
      function (resolve, reject) {

        req({
          method: 'GET',
          uri: uri

        }, function (error, response, body) {

          if (error) {
            reject(error);

          } else {
            resolve(body);
          }

        });

      });

  }

  getNotification(code) {

    var uri = this.uri + this.version + "/transactions/notifications/" + code + "?email=" + this.email + "&token=" + this.token;

    return new Promise(
      function (resolve, reject) {

        req({
          method: 'GET',
          uri: uri

        }, function (error, response, body) {

          if (error) {
            reject(error);

          } else {
            resolve(body);
          }

        });

      });

  }

};

module.exports = pagseguro;
