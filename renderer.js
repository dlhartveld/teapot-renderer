static var canvasWidth = 500;

$(document).ready(
	function() {

		var container = $("#container");
		
		$("#render").click(function() {
			var triangles = sortPointsInTriangles(readInput());
			
			// Prints inputs
			debugInputs(container, triangles);

			transformTriangles(triangles);

		});

		function transformTriangles(triangles) {
			for ( var i = 0; i < triangles.length; i++) {
				var triangle = triangles[i];
				transformTriangle(triangle);
			}
		}

		function transformTriangle(triangle) {
			var equalXs = findEqualX(triangle);
			var equalYs = findEqualY(triangle);

			if (equalXs.length > 0 && equalYs.length > 0) {
				return new Array(triangle);
			} else if (equalYs.length > 0) {
				switch (equalYs[0] + equalYs[1]) {
				case 1:
					return transformEqualYsUnder(triangle);
				case 3:
					return transformEqualYsAbove(triangle);
				default:
					console.log("ERROR: Illegal equalYs value: " + equalYs
							+ " for triangle: " + triangle);
				}
			} else if (equalXs.length > 0) {

			} else {

			}
		}

		function transformEqualYsAbove(triangle) {
			if (triangle[0].x < triangle[1].x) {
				return transformEqualYsLeftOutsideSquare(triangle);
			} else if (triangle[0].x > triangle[2].x) {
				return transformEqualYsRightOutsideSquare(triangle);
			} else {
				return transformEqualYsInsideSquare(triangle);
			}
		}
		
		function transformEqualYsLeftOutsideSquare(triangle) {
			var newy = (triangle[2].x - triangle[1].x) * (triangle[2].y - triangle[0].y) / (triangle[2].x * triangle[0].x);
			var d = new Object();
			d.x = triangle[1].x;
			d.y = newy;
			
			var left = new Object();
			left.points = new Array(triangle[0], d, triangle[1]);
			
			var right = new Object();
			right.points = new Array(d, triangle[1], triangle[2]);
			
			return new Array(right).concat(transformTriangle(left));
		}
		
		function transformEqualYsRightOutsideSquare(triangle) {
			
		}
		
		function transformEqualYsInsideSquare(triangle) {
			
		}

		function findEqualX(triangle) {

			if (triangle[0].x == triangle[1].x) {
				return new Array(0, 1);
			} else if (triangle[1].x == triangle[2].x) {
				return new Array(1, 2);
			} else if (triangle[2].x == triangle[0].x) {
				return new Array(2, 0);
			} else {
				return new Array();
			}

		}

		function findEqualY(triangle) {

			if (triangle[0].y == triangle[1].y) {
				return new Array(0, 1);
			} else if (triangle[1].y == triangle[2].y) {
				return new Array(1, 2);
			} else if (triangle[2].y == triangle[0].y) {
				return new Array(2, 0);
			} else {
				return new Array();
			}

		}

	}
);

// Parser functions

function readInput() {
	return prelude.map(parseLine, $("#input").val().split("\n"));
}

function parseLine(line) {
	return prelude.map(parsePoint, line.substring(2, line.length - 2).split("}\",\"{"));
}

function parsePoint(point) {
	return parseCoordinate(point.split(","));
}

function parseCoordinate(coordinate) {
	return { x: parseFloat(coordinate[0]), y: parseFloat(coordinate[1]) };
}

// Scaling functions.

function determineScaling(triangles) {
	boundingBoxTriangles(triangles);
}

function boundingBoxTriangles(triangles) {
	return prelude.fold1(overlay, prelude.map(measureTriangle, triangles));
}

function overlay(t1, t2) {
	return boundingBox(t1.concat(t2));
}

function boundingBox(t) {
	return createBoundingBox(leftest(t), rightest(t), lowest(t), highest(t));
}

function createBoundingBox(left, right, top, bottom) {
	return { leftX: left, rightX: right, topY: top, bottomY: bottom };
}

function leftest(t) {
	return prelude.minimum(xCoordinates(t));
}

function rightest(t) {
	return prelude.maximum(xCoordinates(t));
}

function highest(t) {
	return prelude.maximum(yCoordinates(t));
}

function lowest(t) {
	return prelude.minimum(yCoordinates(t));
}

function xCoordinates(t) {
	return prelude.map(function(point) { return point.x; }, t);
}

function yCoordinates(t) {
	return prelude.map(function(point) { return point.y; }, t);
}

// Sorting functions

function sortPointsInTriangles(triangles) {
	return prelude.map(sortPointsInTriangle, triangles);
}

function sortPointsInTriangle(triangle) {
	triangle.sort(
			function(p1, p2) {
				if (p1.y != p2.y) {
					return p1.y - p2.y;
				}
				return p1.x - p2.x;
			}
	);
	
	return triangle;
}

// Debug functions 

function debugInputs(container, triangles) {
	container.empty();
	prelude.each(function(t) {
		container.append("<div>{ x: " + t[0].x + " y: " + t[0].y + " , x: " + t[1].x + " y: " + t[1].y + " , x: " + t[2].x + " y: " + t[2].y + " }</div>");
	}, triangles);
}
