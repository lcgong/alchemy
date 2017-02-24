"use strict";
var app = angular.module('mainapp');


app.filter('timeago', timeagoFilter);
function timeagoFilter() {
  return function(input, p_allowFuture) {
    if (angular.isUndefined(input) || input == null) {
      return null;
    }

    var substitute = function(stringOrFunction, number, strings) {
      var string = angular.isFunction(stringOrFunction) ? stringOrFunction(number, dateDifference) : stringOrFunction;
      var value = (strings.numbers && strings.numbers[number]) || number;
      return string.replace(/%d/i, value);
    };

    // console.log('date: ', input, new Date());

    var nowTime = (new Date()).getTime();
    var date = (new Date(input)).getTime();

    var allowFuture = p_allowFuture || false;

    var strings = {
      prefixAgo: '',
      prefixFromNow: '',
      suffixAgo: "",
      suffixFromNow: "至今",
      seconds: "≤1分钟",
      minute: "≥1分钟",
      minutes: "≤%d分钟",
      hour: "≥1小时",
      hours: "≤%d小时",
      day: "1天",
      days: "%d天",
      month: "1月",
      months: "%d月",
      year: "1年",
      years: "%d年"
    };

    var dateDifference = nowTime - date;
    var seconds = Math.abs(dateDifference) / 1000;
    var minutes = seconds / 60;
    var hours = minutes / 60;
    var days = hours / 24;
    var years = days / 365;

    var separator = (strings.wordSeparator === undefined) ? " " : strings.wordSeparator;

    var prefix = strings.prefixAgo;
    var suffix = strings.suffixAgo;

    if (allowFuture) {
      if (dateDifference < 0) {
        prefix = strings.prefixFromNow;
        suffix = strings.suffixFromNow;
      }
    }

    var words = seconds < 45 && substitute(strings.seconds,
        Math.round(seconds), strings) ||
      seconds < 90 && substitute(strings.minute, 1, strings) ||
      minutes < 45 && substitute(strings.minutes,
        Math.round(minutes), strings) ||
      minutes < 90 && substitute(strings.hour, 1, strings) ||
      hours < 24 && substitute(strings.hours,
        Math.round(hours), strings) ||
      hours < 42 && substitute(strings.day, 1, strings) ||
      days < 30 && substitute(strings.days,
        Math.round(days), strings) ||
      days < 45 && substitute(strings.month, 1, strings) ||
      days < 365 && substitute(strings.months,
        Math.round(days / 30), strings) ||
      years < 1.5 && substitute(strings.year, 1, strings) ||
      substitute(strings.years, Math.round(years), strings);

    // console.log(prefix, words, suffix, separator);

    prefix.replace(/ /g, '')
    words.replace(/ /g, '')
    suffix.replace(/ /g, '')

    return (prefix + ' ' + words + '' + suffix + ' ' + separator);

  };
}
