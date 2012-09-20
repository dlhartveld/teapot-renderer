
$(document).ready(
	function() {

		var container = $("#container");
		var canvasWidth = container.width();
		var canvasPadding = 20;
		
		$("#render").click(function() {
			var lines = $("#input").val().trim().split("\n");
			var triangles = scaleTriangles(canvasWidth, canvasPadding, readInput(lines));
			
			// Resize the viewport to make the render fit.
			container.empty().css("height", calculateViewportHeight(canvasWidth, canvasPadding, triangles) + "px");
			
			var polygons = subdivideAll(triangles);
			
			for (var i = 0; i < polygons.length; i++) {
				var polygon = polygons[i];
				var box = boundingBox(polygon);
				var pivot = pivotOf(polygon);
				
				var width = box.leftX == pivot.x ? (box.rightX - pivot.x) : (box.leftX - pivot.x);
				var height = box.topY == pivot.y ? (box.bottomY - pivot.y) : (box.topY - pivot.y);
				
				render(polygon, pivot, width, height);
			}
		});
		
		function render(polygon, pivot, width, height) {
			if (width > 0) {
				if (height > 0) {
					container.append("<div style='position: absolute; top: " + topRight(polygon).y + "px; left: " + (topRight(polygon).x - width) + "px; width: 0px; height: 0px; border-right: " + width + "px solid rgba(0,0,0,0); border-top: " + height + "px solid red;'></div>");
				}
				else if (height < 0) {
				}
			}
			else if (width < 0) {
				if (height > 0) {
					container.append("<div style='position: absolute; top: " + topLeft(polygon).y + "px; left: " + topLeft(polygon).x + "px; width: 0px; height: 0px; border-left: " + (-1 * width) + "px solid rgba(0,0,0,0); border-top: " + height + "px solid blue;'></div>");
				}
				else if (height < 0) {
					
				}
			}
		}

	}
);

// Objects

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

function readInput(lines) {
	return prelude.map(parseLine, lines);
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

// Triangle functions.

function pivotOf(triangle) {
	return triangle.points[(prelude.sum(findEqualX(triangle)) + prelude.sum(findEqualY(triangle))) - 3];
}

function subdivideAll(triangles) {
	return prelude.fold(concat, [], prelude.map(subdivide, triangles));
}

function subdivide(triangle) {
	if (boxWidth(boundingBox(triangle)) == 1 || boxHeight(boundingBox(triangle)) == 1) {
		return [];
	}
	switch (findEqualX(triangle).length) {
		case 3: return subdivideVerticialLine(sortPointsByY(triangle));
		case 2: return subdivideVerticalTriangle(sortPointsByY(triangle), findEqualX(sortPointsByY(triangle)));
	}
	switch (findEqualY(triangle).length) {
		case 3: return subdivideHorizontalLine(sortPointsByX(triangle));
		case 2: return subdivideHorizontalTriangle(sortPointsByX(triangle), findEqualY(sortPointsByX(triangle)));
	}
	return subdivideArbitraryTriangle(sortPointsByY(triangle));
}

function subdivideArbitraryTriangle(triangle) {
	return concat(
			subdivide(new Triangle(new Array(triangle.points[0], triangle.points[1], calculateProjectionPointOnVerticalTriangle(triangle)))),
			subdivide(new Triangle(new Array(triangle.points[1], calculateProjectionPointOnVerticalTriangle(triangle), triangle.points[2])))
	);
}

function subdivideVerticalTriangle(triangle, pointsOnSameX) {
	if (arrayEqual(pointsOnSameX, new Array(1, 2))) {
		return concat(
				subdivide(new Triangle(new Array(triangle.points[1], triangle.points[0], calculateProjectionPointOnVerticalTriangle(triangle, pointsOnSameX)))),
				new Array(new Triangle(new Array(triangle.points[1], triangle.points[2], calculateProjectionPointOnVerticalTriangle(triangle, pointsOnSameX))))
		);
	}
	else if (arrayEqual(pointsOnSameX, new Array(0, 1))) {
		return concat(
				new Array(new Triangle(new Array(triangle.points[1], triangle.points[0], calculateProjectionPointOnVerticalTriangle(triangle, pointsOnSameX)))),
				subdivide(new Triangle(new Array(triangle.points[1], triangle.points[2], calculateProjectionPointOnVerticalTriangle(triangle, pointsOnSameX))))
		);
	}
	else {
		return concat(
				new Array(new Triangle(new Array(triangle.points[1], triangle.points[0], calculateProjectionPointOnVerticalTriangle(triangle, pointsOnSameX)))),
				new Array(new Triangle(new Array(triangle.points[1], triangle.points[2], calculateProjectionPointOnVerticalTriangle(triangle, pointsOnSameX))))
		);
	}
}

function calculateProjectionPointOnVerticalTriangle(triangle, pointsOnSameX) {
	if (arrayEqual(pointsOnSameX, new Array(0, 2))) {
		return new Point(triangle.points[0].x, triangle.points[1].y);
	}
	return new Point(
			prelude.round((triangle.points[otherPoint(pointsOnSameX)].x - triangle.points[pointsOnSameX[1]].x) * ((triangle.points[pointsOnSameX[1]].y - triangle.points[pointsOnSameX[0]].y) / (triangle.points[2].y - triangle.points[0].y)) + triangle.points[1].x),
			triangle.points[1].y
	);
}

function subdivideHorizontalTriangle(triangle, pointsOnSameY) {
	if (arrayEqual(pointsOnSameY, new Array(1, 2))) {
		return concat(
				subdivide(new Triangle(new Array(triangle.points[1], triangle.points[0], calculateProjectionPointOnHorizontalTriangle(triangle, pointsOnSameY)))),
				new Array(new Triangle(new Array(triangle.points[1], triangle.points[2], calculateProjectionPointOnHorizontalTriangle(triangle, pointsOnSameY))))
		);
	}
	else if (arrayEqual(pointsOnSameY, new Array(0, 1))) {
		return concat(
				new Array(new Triangle(new Array(triangle.points[1], triangle.points[0], calculateProjectionPointOnHorizontalTriangle(triangle, pointsOnSameY)))),
				subdivide(new Triangle(new Array(triangle.points[1], triangle.points[2], calculateProjectionPointOnHorizontalTriangle(triangle, pointsOnSameY))))
		);
	}
	else {
		return concat(
				new Array(new Triangle(new Array(triangle.points[1], triangle.points[0], calculateProjectionPointOnHorizontalTriangle(triangle, pointsOnSameY)))),
				new Array(new Triangle(new Array(triangle.points[1], triangle.points[2], calculateProjectionPointOnHorizontalTriangle(triangle, pointsOnSameY))))
		);
	}
}

function calculateProjectionPointOnHorizontalTriangle(triangle, pointsOnSameY) {
	if (arrayEqual(pointsOnSameY, new Array(0, 2))) {
		return new Point(triangle.points[1].x, triangle.points[0].y);
	}
	return new Point(
			triangle.points[1].x,
			prelude.round((triangle.points[1].y - (triangle.points[pointsOnSameY[1]].y - triangle.points[otherPoint(pointsOnSameY)].y) * ((triangle.points[pointsOnSameY[1]].x - triangle.points[pointsOnSameY[0]].x) / (triangle.points[2].x - triangle.points[0].x))))
	);
}

function concat(e1, e2) {
	return prelude.append(prelude.append([], e1), e2);
}

function otherPoint(ids) {
	return diff([0,1,2], ids)[0];
}

function arrayEqual(a1, a2) {
	if (a1.length != a2.length) {
		return false;
	}
	return diff(a1, a2).length == 0 && diff(a2, a1).length == 0;
}

function diff(haystack, subtract) {
	return haystack.filter(function(i) {return !(subtract.indexOf(i) > -1);});
}

//untested.
function subdivideVerticialLine(triangle) {
	return new Array(
			createTriangleFromTwoPoints(prelude.initial(triangle.points)), 
			createTriangleFromTwoPoints(prelude.tail(triangle.points))
	);
}

//untested.
function subdivideHorizontalLine(triangle) {
	return new Array(
			createTriangleFromTwoPoints(prelude.initial(triangle.points)), 
			createTriangleFromTwoPoints(prelude.tail(triangle.points))
	);
}

//untested.
function createTriangleFromTwoPoints(points) {
	return new Triangle(prelude.concat(points, points[0]));
}

function findEqualX(triangle) {
	if (prelude.unique(xCoordinates(triangle.points)).length == 1) {
		return new Array(0, 1, 2);
	} 
	else if (triangle.points[0].x == triangle.points[1].x) {
		return new Array(0, 1);
	} 
	else if (triangle.points[1].x == triangle.points[2].x) {
		return new Array(1, 2);
	} 
	else if (triangle.points[0].x == triangle.points[2].x) {
		return new Array(0, 2);
	} 
	else {
		return new Array();
	}
}

function findEqualY(triangle) {
	if (prelude.unique(yCoordinates(triangle.points)).length == 1) {
		return new Array(0, 1, 2);
	} 
	else if (triangle.points[0].y == triangle.points[1].y) {
		return new Array(0, 1);
	} 
	else if (triangle.points[1].y == triangle.points[2].y) {
		return new Array(1, 2);
	} 
	else if (triangle.points[0].y == triangle.points[2].y) {
		return new Array(0, 2);
	} 
	else {
		return new Array();
	}
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

// Point functions

function leftest(points) {
	return prelude.minimum(xCoordinates(points));
}

function rightest(points) {
	return prelude.maximum(xCoordinates(points));
}

function highest(points) {
	return prelude.maximum(yCoordinates(points));
}

function lowest(points) {
	return prelude.minimum(yCoordinates(points));
}

function xCoordinates(points) {
	return prelude.map(function(point) { return point.x; }, points);
}

function yCoordinates(points) {
	return prelude.map(function(point) { return point.y; }, points);
}

// Bounding box functions

function boundingBox(t) {
	if (t.constructor == Triangle) {
		return new Box(leftest(t.points), rightest(t.points), lowest(t.points), highest(t.points));
	}
	return prelude.fold1(overlap, prelude.map(boundingBox, t));
}

function overlap(t1, t2) {
	return new Box(
			Math.min(t1.leftX, t2.leftX), 
			Math.max(t1.rightX, t2.rightX), 
			Math.min(t1.topY, t2.topY), 
			Math.max(t1.bottomY, t2.bottomY) 
	);
}

function topLeft(box) {
	if (box.constructor == Triangle) {
		return topLeft(boundingBox(box));
	}
	return new Point(box.leftX, box.topY);
}

function topRight(box) {
	if (box.constructor == Triangle) {
		return topRight(boundingBox(box));
	}
	return new Point(box.rightX, box.topY);
}

function bottomLeft(box) {
	if (box.constructor == Triangle) {
		return bottomLeft(boundingBox(box));
	}
	return new Point(box.leftX, box.bottomY);
}

function bottomRight(box) {
	if (box.constructor == Triangle) {
		return bottomRight(boundingBox(box));
	}
	return new Point(box.rightX, box.bottomY);
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

function sortPointsInTriangles(sorter, triangles) {
	return prelude.map(sorter, triangles);
}

function sortPointsByX(triangle) {
	return new Triangle(
		triangle.points.slice().sort(
				function(p1, p2) {
					return p1.x - p2.x;
				}
		)
	);
}

function sortPointsByY(triangle) {
	return new Triangle(
		triangle.points.slice().sort(
				function(p1, p2) {
					return p1.y - p2.y;
				}
		)
	);
}

// Debug functions

function debugInputs(container, triangles) {
	container.empty();
	prelude.each(
			function(t) {
				container.append("<div>{ x: " + t.points[0].x + " y: " + t.points[0].y + " , x: " + t.points[1].x + " y: " + t.points[1].y + " , x: " + t.points[2].x + " y: " + t.points[2].y + " }</div>");
			}, 
			listyfy(triangles)
	);
}

function listyfy(i) {
	if (Array.isArray(i)) {
		return i;
	}
	return [ i ];
}

