import React, { useState, useEffect } from "react";
import fetch from "./services/points.service";
import "./App.css";
import Header from "./components/header/Header";
import Table from "./components/table/Table";

function calculateResults(incomingData) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const pointsPerTransaction = incomingData.map((transaction) => {
    let points = 0;
    const diff100 = transaction.amount - 100;
    const diff50 = transaction.amount - diff100 - 50;

    if (diff100 > 0) {
      points += diff100 * 2;
    }
    if (transaction.amount > 50) {
      points += diff50;
    }
    const month = new Date(transaction.transactionDate).getMonth();
    return { ...transaction, points, month };
  });

  let byCustomer = {};
  let groupByPoints = {};
  pointsPerTransaction.forEach((pointsPerTransaction) => {
    let { customerId, customerName, month, points, amount } =
      pointsPerTransaction;
    if (!byCustomer[customerId]) {
      byCustomer[customerId] = [];
    }
    if (!groupByPoints[customerName]) {
      groupByPoints[customerName] = 0;
    }
    groupByPoints[customerName] += points;
    if (byCustomer[customerId][month]) {
      byCustomer[customerId][month].points += points;
      byCustomer[customerId][month].amount += amount;
      byCustomer[customerId][month].monthNumber = month;
      byCustomer[customerId][month].numTransactions++;
    } else {
      byCustomer[customerId][month] = {
        customerId,
        customerName,
        monthNumber: month,
        month: months[month],
        numTransactions: 1,
        amount,
        points,
      };
    }
  });

  let groupByCustomer = [];
  for (const custKey in byCustomer) {
    byCustomer[custKey].forEach((cRow) => {
      groupByCustomer.push(cRow);
    });
  }
  let totByCustomer = [];
  for (const key in groupByPoints) {
    totByCustomer.push({
      customerName: key,
      points: groupByPoints[key],
    });
  }

  return {
    groupByCustomer,
    groupByPoints: totByCustomer,
  };
}

function App() {
  const [transactionData, setTransactionData] = useState(null);

  const rewardTableColumns = [
    {
      columnTitle: "Customer",
      columnName: "customerName",
    },
    {
      columnTitle: "Month",
      columnName: "month",
    },
    {
      columnTitle: "No. of Transactions",
      columnName: "numTransactions",
    },
    {
      columnTitle: "Amount",
      columnName: "amount",
    },
    {
      columnTitle: "Reward Points",
      columnName: "points",
    },
  ];

  const totalTableColumns = [
    {
      columnTitle: "Customer",
      columnName: "customerName",
    },
    {
      columnTitle: "Points",
      columnName: "points",
    },
  ];

  useEffect(() => {
    fetch().then((data) => {
      const results = calculateResults(data);
      setTransactionData(results);
    });
  }, []);

  return (
    <div>
      <Header />
      {transactionData !== null && (
        <div className="table-container">
          <h4>Month wise customer points</h4>
          <Table
            thead={rewardTableColumns}
            tbody={transactionData.groupByCustomer}
          />
          <br />
          <br />
          <h4>Total customer points</h4>
          <Table
            thead={totalTableColumns}
            tbody={transactionData.groupByPoints}
          />
        </div>
      )}
    </div>
  );
}

export default App;
