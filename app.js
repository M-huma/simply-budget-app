//////////////////// Data
const budgetController = (function () {
  const Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentages = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  const Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (curr) {
      sum = sum + curr.value;
    });
    data.totals[type] = sum;
  };

  const data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };
  console.log(data);

  return {
    addItem: function (type, des, val) {
      var newItem, ID;

      //   create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //   create new item base on the "inc" or "exp" type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      //    push it into our data structure
      data.allItems[type].push(newItem);

      //   return the new element
      return newItem;
    },

    deleteItem: function (type, id) {
      var ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      var index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      // calcluate toal income and expesense
      calculateTotal("exp");
      calculateTotal("inc");
      // claculate the butdget: incom - expenses
      data.budget = data.totals.inc - data.totals.exp;
      //  calculate the percemtage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentages(data.totals.inc);
      });
    },

    getPercentage: function () {
      var allPercentages = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPercentages;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },
  };
})();

//////////////// User Interface
const UIcontroller = (function () {
  const DomInputStrings = {
    inputType: ".add__type",
    description: ".add__description",
    value: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__tab",
    expenseContainer: ".expense__tab",
    budgetLabel: ".budget__display",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expense--value",
    percentageLabel: ".budget__expense--percentage",
    budgetList: ".expenses__list",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".display__title--month",
  };

  const formatNumber = function (num, type) {
    var numSplit, int, dec;
    // + or - before number
    // exactly 2 deciaml points
    // comma seperating the thousands

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");

    int = numSplit[0];
    if (int.length > 3) {
      int =
        int.substr(0, int.length - 3) +
        "," +
        int.substr(int.length - 3, int.length);
    }

    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + "" + int + "." + dec;
  };

  var NodeListForEach = function (list, callBack) {
    for (var i = 0; i < list.length; i++) {
      callBack(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DomInputStrings.inputType).value, // will be for iether inc, or exp
        description: document.querySelector(DomInputStrings.description).value,
        value: parseFloat(document.querySelector(DomInputStrings.value).value),
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml, element;
      //  create HTMl string with placeholder text

      if (type === "inc") {
        element = DomInputStrings.incomeContainer;

        html = `<div class="item clearfix" id="inc-%id%">
        <div class="item__description">%description%</div>
        <div class="right clearfix">
          <div class="item__value">%value%</div>
          <div class="item__delete">
            <button class="item__delete--btn" type="button">
              X
            </button>
          </div>
        </div>
      </div>`;
      } else if (type === "exp") {
        element = DomInputStrings.expenseContainer;

        html = `<div class="item clearfix" id="exp-%id%">
        <div class="item__description">%description%</div>
        <div class="right clearfix">
          <div class="item__value">%value%</div>
          <div class="item__percentage">21%</div>
          <div class="item__delete">
            <button class="item__delete--btn" type="button">
              X
            </button>
          </div>
        </div>
      </div>`;
      }

      // replace the placeholder text with actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      //    insert the html into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function (selectorId) {
      var el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      var fields, fieldsArray;
      fields = document.querySelectorAll(
        DomInputStrings.description + "," + DomInputStrings.value
      );

      fieldsArray = Array.prototype.slice.call(fields);
      fieldsArray.forEach(function (current, index, array) {
        current.value = "";
      });

      fieldsArray[0];
    },

    displaybudget: function (obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DomInputStrings.budgetLabel).textContent =
        formatNumber(obj.budget, type);

      document.querySelector(DomInputStrings.incomeLabel).textContent =
        formatNumber(obj.totalInc, "inc");

      document.querySelector(DomInputStrings.expensesLabel).textContent =
        formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DomInputStrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DomInputStrings.percentageLabel).textContent =
          "--";
      }
    },

    displayPercentage: function (percentages) {
      var fields = document.querySelectorAll(DomInputStrings.expensesPercLabel);

      NodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth: function () {
      var now, months, month, year;
      now = new Date();

      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DomInputStrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    changedType: function () {
      var fields = document.querySelectorAll(
        DomInputStrings.inputType +
          "," +
          DomInputStrings.description +
          "," +
          DomInputStrings.value
      );

      NodeListForEach(fields, function (cur) {
        cur.classList.toggle("red__focus");
      });

      document.querySelector(DomInputStrings.inputType).classList.toggle("red");
      document.querySelector(DomInputStrings.inputBtn).classList.toggle("red");
    },

    // this passes the object to one module to another
    getDomInputString: function () {
      return DomInputStrings;
    },
  };
})();

/////////////// Main controller
const controller = (function (budgetCtrl, UICtrl) {
  const setupEventListeners = function () {
    // here we get the passed object from the UIcontroller module
    // we place the dom strings here becuase we need them for the event handler button
    const DOM = UICtrl.getDomInputString();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.budgetList)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  const updatePercentages = function () {
    // 1. calculate percentages
    budgetCtrl.calculatePercentages();
    // 2. read percentages from the budget controller
    var percentages = budgetCtrl.getPercentage();
    // 3. update the UI with the new perentages
    UICtrl.displayPercentage(percentages);
  };

  const updateBudget = function () {
    // 1. calculate the budget
    budgetCtrl.calculateBudget();
    // 2 return the budget
    var budget = budgetCtrl.getBudget();
    // 3. display the budgte on the UI
    UICtrl.displaybudget(budget);
  };

  const ctrlAddItem = function () {
    var input, newItem;
    // 1. get input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. add item to button controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // 3. add the item to the UI
      UICtrl.addListItem(newItem, input.type);
      // 4.1 clear the fields
      UICtrl.clearFields();

      // 5 claculate and update budget
      updateBudget();

      //   6. calcualte and update percentages
      updatePercentages();
    }
  };

  const ctrlDeleteItem = function (e) {
    var itemId, splitId, type, ID;

    itemId = e.target.parentNode.parentNode.parentNode.id;

    if (itemId) {
      splitId = itemId.split("-");
      type = splitId[0];
      ID = parseInt(splitId[1]);

      //   1. delete item from data structure
      budgetCtrl.deleteItem(type, ID);
      //  2. delete the tiem fro the UI
      UICtrl.deleteListItem(itemId);
      //  3. update and show the new budget
      updateBudget();
    }
  };

  return {
    init: function () {
      console.log("application started");
      UICtrl.displayMonth();
      UICtrl.displaybudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0,
      });
      setupEventListeners();
    },
  };
})(budgetController, UIcontroller);

controller.init();
