module.exports = {
  requireModule: ['ts-node/register'],
  require: [
    'src/hooks/**/*.ts',
    'src/step-definitions/**/*.ts'
  ],
  paths: ['features/**/*.feature'],
  format: [
    'progress',
    'json:reports/cucumber-report.json',
    'html:reports/cucumber-report.html'
  ]
};
