describe("the parse functions", function() {

	it("should be able to parse a coordinate", function() {
		expect(parseCoordinate(new Array(0.4, 0.6))).toEqual(new Point(0.4, 0.6));
	});
	
	it("should be able to parse a point", function() {
		expect(parsePoint("12,8")).toEqual(new Point(12, 8));
	});
	
	it("should be able to parse a line", function() {
		expect(parseLine("\"{0,200}\",\"{0,200}\",\"{0,200}\"")).toEqual(
				new Triangle(new Array(new Point(0, 200), new Point(0, 200), new Point(0, 200))));
	});
	
	it("should be able to parse several lines", function() {
		var input = new Array(
				"\"{0,300}\",\"{0,300}\",\"{0,300}\"",
				"\"{0,200}\",\"{0,200}\",\"{0,200}\"",
				"\"{0,100}\",\"{0,100}\",\"{0,100}\""
		);
		
		expect(readInput(input)).toEqual(new Array(
				new Triangle(new Array(new Point(0,300), new Point(0, 300), new Point(0, 300))),
				new Triangle(new Array(new Point(0,200), new Point(0, 200), new Point(0, 200))),
				new Triangle(new Array(new Point(0,100), new Point(0, 100), new Point(0, 100)))
		));
	});
	
});