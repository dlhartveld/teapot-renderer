$(document).ready(
	function() {

		$("#render").click(function() {
			var triangles = readInput();

			sortPointsInTriangle(triangles);
			transformTriangles(triangles);

			console.log(triangles);

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
			if (triangle.points[0].x < triangle.points[1].x) {
				return transformEqualYsLeftOutsideSquare(triangle);
			} else if (triangle.points[0].x > triangle.points[2].x) {
				return transformEqualYsRightOutsideSquare(triangle);
			} else {
				return transformEqualYsInsideSquare(triangle);
			}
		}
		
		function transformEqualYsLeftOutsideSquare(triangle) {
			var newy = (triangle.points[2].x - triangle.points[1].x) * (triangle.points[2].y - triangle.points[0].y) / (triangle.points[2].x * triangle.points[0].x);
			var d = new Object();
			d.x = triangle.points[1].x;
			d.y = newy;
			
			var left = new Object();
			left.points = new Array(triangle.points[0], d, triangle.points[1]);
			
			var right = new Object();
			right.points = new Array(d, triangle.points[1], triangle.points[2]);
			
			return new Array(right).concat(transformTriangle(left));
		}
		
		function transformEqualYsRightOutsideSquare(triangle) {
			
		}
		
		function transformEqualYsInsideSquare(triangle) {
			
		}

		function findEqualX(triangle) {

			if (triangle.points[0].x == triangle.point[1].x) {
				return new Array(0, 1);
			} else if (triangle.points[1].x == triangle.points[2].x) {
				return new Array(1, 2);
			} else if (triangle.points[2].x == triangle.point[0].x) {
				return new Array(2, 0);
			} else {
				return new Array();
			}

		}

		function findEqualY() {

			if (triangle.points[0].y == triangle.point[1].y) {
				return new Array(0, 1);
			} else if (triangle.points[1].y == triangle.points[2].y) {
				return new Array(1, 2);
			} else if (triangle.points[2].y == triangle.point[0].y) {
				return new Array(2, 0);
			} else {
				return new Array();
			}

		}

		function sortPointsInTriangle(triangles) {
			for ( var i = 0; i < triangles.length; i++) {
				var triangle = triangles[i];
				triangle.points.sort(function(xyCoord1, xyCoord2) {
					var compare = xyCoord1.y - xyCoord2.y;
					if (compare != 0) {
						return compare;
					}
					return xyCoord1.x - xyCoord2.x;
				});
			}
		}

		function readInput() {
			var input = $("#input").val();
			var lines = input.split("\n");

			var triangles = [];

			for ( var i = 0; i < lines.length; i++) {
				var line = lines[i];

				var points = line.substring(2, line.length - 2).split(
						"}\",\"{");

				var triangle = {};
				triangle.points = [];

				for ( var j = 0; j < points.length; j++) {
					var point = points[j];

					var xyPoint = {};

					var coord = point.split(",");
					xyPoint.x = (parseFloat(coord[0]) + 1) * 250;
					xyPoint.y = (parseFloat(coord[1]) + 1) * 250;

					triangle.points.push(xyPoint);
				}

				triangles.push(triangle);
			}

			return triangles;
		}

	}
);