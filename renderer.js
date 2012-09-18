
$(document).ready(
	function() {

		var container = $("#container");
		var canvasWidth = container.width();
		var canvasPadding = 20;
		
		$("#render").click(function() {
			var triangles = sortPointsInTriangles(readInput());
			triangles = scaleTriangles(canvasWidth, canvasPadding, triangles);
			
			// Prints inputs
			debugInputs(container, triangles);
			scaleViewport(canvasWidth, canvasPadding, triangles, container);

			//transformTriangles(triangles);

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

//Objects

function Point(x, y) {
	this.x = x;
	this.y = y;
}

function Triangle(points) {
	this.points = points;
}

function Box(leftX, rightX, topY, bottomY) {
	this.leftX = leftX;
	this.rightX = rightX;
	this.topY = topY;
	this.bottomY = bottomY;
}

// Parser functions

function readInput() {
	return prelude.map(parseLine, $("#input").val().split("\n"));
}

function parseLine(line) {
	return new Triangle(prelude.map(parsePoint, line.substring(2, line.length - 2).split("}\",\"{")));
}

function parsePoint(point) {
	return parseCoordinate(point.split(","));
}

function parseCoordinate(coordinate) {
	return new Point(parseFloat(coordinate[0]), parseFloat(coordinate[1]));
}

// Scaling functions.

function scaleViewport(width, padding, triangles, viewport) {
	viewport.css("height", calculateViewportHeight(width, padding, triangles) + "px");
}

function calculateViewportHeight(width, padding, triangles) {
	return prelude.ceiling(ratio(boundingBox(triangles)) * (width - 2*padding) + 2*padding)
}

function scaleTriangles(canvasWidth, canvasPadding, triangles) {
	return scaleTrianglesWithScalar(triangles, pointMapperBasedOnTriangles(canvasWidth, canvasPadding, triangles));
}

function pointMapperBasedOnTriangles(canvasWidth, canvasPadding, triangles) {
	return pointMapper(canvasWidth - canvasPadding * 2, canvasPadding, boundingBox(triangles));
}

function scaleTrianglesWithScalar(triangles, scalar) {
	return prelude.map(prelude.curry(scalePointsInTriangle)(scalar), triangles);
}

function scalePointsInTriangle(scalar, triangle) {
	return new Triangle(prelude.map(scalar, triangle.points));
}

function pointMapper(width, padding, box) {
	function mapX(p) {
		if (boxWidth(box) == 0) {
			return padding;
		}
		return (p.x - box.leftX) / boxWidth(box) * width + padding;
	}
	
	function mapY(p) {
		if (boxHeight(box) == 0) {
			return padding;
		}
		return (p.y - box.topY) / boxHeight(box) * width * ratio(box) + padding;
	}
	
	return function(p) {
		return new Point(mapX(p), mapY(p));
	};
}

function boundingBox(t) {
	if (t.constructor == Triangle) {
		return new Box(leftest(t), rightest(t), lowest(t), highest(t));
	}
	return prelude.fold1(overlay, prelude.map(boundingBox, t));
}

function overlay(t1, t2) {
	return new Box(
			Math.min(t1.leftX, t2.leftX), 
			Math.max(t1.rightX, t2.rightX), 
			Math.min(t1.topY, t2.topY), 
			Math.max(t1.bottomY, t2.bottomY) 
	);
}

function leftest(t) {
	return prelude.minimum(xCoordinates(t.points));
}

function rightest(t) {
	return prelude.maximum(xCoordinates(t.points));
}

function highest(t) {
	return prelude.maximum(yCoordinates(t.points));
}

function lowest(t) {
	return prelude.minimum(yCoordinates(t.points));
}

function xCoordinates(points) {
	return prelude.map(function(point) { return point.x; }, points);
}

function yCoordinates(points) {
	return prelude.map(function(point) { return point.y; }, points);
}

function boxWidth(box) {
	return box.rightX - box.leftX;
}

function boxHeight(box) {
	return box.bottomY - box.topY;
}

function ratio(box) {
	return boxHeight(box) / boxWidth(box);
}

// Sorting functions

function sortPointsInTriangles(triangles) {
	return prelude.map(sortPointsInTriangle, triangles);
}

function sortPointsInTriangle(triangle) {
	triangle.points.sort(
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
	prelude.each(
			function(t) {
				container.append("<div>{ x: " + t.points[0].x + " y: " + t.points[0].y + " , x: " + t.points[1].x + " y: " + t.points[1].y + " , x: " + t.points[2].x + " y: " + t.points[2].y + " }</div>");
			}, 
			triangles
	);
}

