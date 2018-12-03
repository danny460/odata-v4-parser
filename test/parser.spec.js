const expect = require("chai").expect;

const Parser = require("../lib/parser").Parser;

describe("Parser", () => {
  it("should instantiate odata parser", () => {
    var parser = new Parser();
    var ast = parser.filter("Categories/all(d:d/Title eq 'alma')");
    expect(
      ast.value.value.value.value.next.value.value.predicate.value.value.right
        .value
    ).to.equal("Edm.String");
  });

  it("should parse query string", () => {
    var parser = new Parser();
    var ast = parser.query("$filter=Title eq 'alma'");
    expect(ast.value.options[0].type).to.equal("Filter");
  });

  it("should parse multiple orderby params", () => {
    var parser = new Parser();
    var ast = parser.query("$orderby=foo,bar");
    expect(ast.value.options[0].value.items[0].raw).to.equal("foo");
    expect(ast.value.options[0].value.items[1].raw).to.equal("bar");
  });

  it("should parse custom query options", () => {
    var parser = new Parser();
    var ast = parser.query("foo=123&bar=foobar");
    expect(ast.value.options[0].value.key).to.equal("foo");
    expect(ast.value.options[0].value.value).to.equal("123");
    expect(ast.value.options[1].value.key).to.equal("bar");
    expect(ast.value.options[1].value.value).to.equal("foobar");
  });

  it("should throw error parsing invalid custom query options", () => {
    var parser = new Parser();
    var error = false;
    try{
      var ast = parser.query("$foo=123");
      error = true;
    }catch(err){}
    expect(error).to.be.false;
  });

  it("should parse aggregation pipeline", () => {
    const parser = new Parser();
    const ast = parser.query("$apply=groupby((time),aggregate(amount with sum as total))"
      + "/aggregate(Sales/Amount with sum as Total)");
    expect(ast.value.options[0].type).to.equal("Apply");
    expect(ast.value.options[0].value.value.pipe[0].value.method).to.equal("groupby");
    expect(ast.value.options[0].value.value.pipe[1].value.method).to.equal("aggregate");
    expect(ast.value.options[0].value.value.pipe[1].value.parameters[0].value.aggregationMethod.raw).to.equal("sum");
    expect(ast.value.options[0].value.value.pipe[1].value.parameters[0].value.alias.raw).to.equal("Total");
    expect(ast.value.options[0].value.value.pipe[1].value.parameters[0].value.property.raw).to.equal("Sales/Amount");
  });

  it("should parse filter in transformation set", () => {
    const parser = new Parser();
    const ast = parser.query("$apply=filter(date gt 2018-09-03T16:00:00Z and cardId eq '1234')")
    expect(ast.value.options[0].value.value.pipe[0].value.method).to.equal("filter")
  });

});
