var _face = function()
{
	  		var updateFaceExpressionAndColor = function(value)
			{
				score = value;
				 if (score <= 100 && score > 65)
		         {
		         	$("#face_color").attr("src", "Green_Face.png");
		         }
		         else if (score <= 65 && score >= 35)
		         {
		         	
		         	$("#face_color").attr("src", "Yellow_Face.png");
		         }
		         else if (score <= 35 && score >= 0)
		         {
					$("#face_color").attr("src", "Red_Face.png");
		         };

		         // Score is between 50 and 100, where we use the "smiling image"
		         if (score <= 100 && score >50)
		         {
		         	// MOUTH
		         	var percentage = (score - 50) * 2;
		         	var pixelValue = percentage * 151/100 + 3;
		         	$("#mouth").css("height", pixelValue); 
		         	$("#mouth_sad").css('visibility', 'hidden');
		         	$("#mouth").css('visibility', 'visible');

		         	// FACE COLOR
		         	$("#green_face").css('visibility', 'visible');
		         	$("#red_face").css('visibility', 'hidden');
		         	var opacity_value = percentage / 100.0;
		         	$("#green_face").css({ opacity: opacity_value });
		         }
		         // Score is between 50 and 0, where we use the flipped version of the smiling image, dubbed the "horrified image"
		         else if (score <=50 && score>=0)
		         {
		         	// MOUTH
		         	var percentage = (100 - ((score) * 2)) ;
		         	var pixelValue = percentage * 151 / 100 + 3 ;
		         	$("#mouth_sad").css("height", pixelValue); 
		         	$("#mouth_sad").css('visibility', 'visible');
		         	$("#mouth").css('visibility', 'hidden');

		         	// FACE COLOR
		         	$("#green_face").css('visibility', 'hidden');
		         	$("#red_face").css('visibility', 'visible');
		         	var opacity_value = percentage / 100.0;
		         	$("#red_face").css({ opacity: opacity_value });
		         };
			}

			var resizeGreenBar = function(score)
			{
				var pixelValue = 484 * score / 100.0;
				$("#progress_bar_green").css('height', pixelValue);
			}

			// PUBLIC FUNCTION
			// ----------------------------------------------------------------
			// This function animates the face and the bar to display the score
			// Parameters:
			// score- Integer out of 100 that the face will animate to match
			this.animateScore = function(score)
			{
				var current_score = 0;
				// function that will gradually be called
				var intervalScore = function () {
				 	current_score = current_score + 1;
				 	
				 	if (current_score < 20)
				 	{
				 		$("#feedback_element").text("Terrible!");
				 	}
				 	else if (current_score < 40)
				 	{
				 		$("#feedback_element").text("Bad!");
				 	}
				 	else if (current_score < 60)
				 	{
				 		$("#feedback_element").text("Mediocre!");
				 	}
				 	else if (current_score < 80)
				 	{
				 		$("#feedback_element").text("Awesome!");
				 	}
				 	else if (current_score < 90)
				 	{
				 		$("#feedback_element").text("Amazing!");
				 	}
				 	else
				 	{
				 		$("#feedback_element").text("Perfect!");
				 	}

				 	if (score >= current_score)
				 	{
				 		resizeGreenBar(current_score);
			       	    $("#score_element").text(current_score);
			       	    updateFaceExpressionAndColor(current_score);
			       	}
			    	else
			    	{
			    		clearInterval(intervalScore);
			    	}
		    	};
				setInterval(intervalScore, 50);
			}
}