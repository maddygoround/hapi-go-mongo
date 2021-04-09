const moment = require("moment");
module.exports.reducer = (req, data) => {
  var result = [];
  const stats =
    req.params.type === "profit" ? "summaryProfit" : "summaryVisits";
  data.reduce(function (res, value) {
    if (!res[[value.month, value.year]]) {
      res[[value.month, value.year]] = {
        month: moment()
          .month(value.month - 1)
          .format("MMMM"),
        [stats]: 0,
        year: value.year,
      };
      result.push(res[[value.month, value.year]]);
    }
    res[[value.month, value.year]][stats] +=
      req.params.type === "profit" ? value.ticket_price : 1;
    return res;
  }, {});

  return result;
};
