var polls_count = 0;
// Controller for the poll list
function PollListCtrl($scope, Poll) {
	$scope.polls = Poll.query();
	polls_count = $scope.polls.length;
}

// Controller for an individual poll
function PollItemCtrl($scope, $location, $routeParams, socket, Poll) {
	$scope.poll = Poll.get({pollId: $routeParams.pollId});

	socket.on('myvote', function(data) {
		console.dir(data);
		if(data._id == $routeParams.pollId) {
			$scope.poll = data;
		}
	});

	socket.on('vote', function(data) {
		console.dir(data);
		if(data._id == $routeParams.pollId) {
			var hasVoted = $scope.poll.userVoted;
		  $scope.poll = data;
		  $scope.poll.userVoted = hasVoted;
		}
	});

	$scope.vote = function() {
		var pollId = $scope.poll._id,
				choiceId = $scope.poll.userVote;

		if(choiceId) {
			var voteObj = { poll_id: pollId, choice: choiceId };
			socket.emit('send:vote', voteObj);
		} else {
			alert('You must select an option to vote for');
		}
	};
}

// Controller for creating a new poll
function PollNewCtrl($scope, $location, Poll) {
	// Define an empty poll model object
	$scope.poll = {
	  _id: polls_count+1,
		question: '',
		choices: [ { _id: 1, text: '', votes: [] }, { _id: 2, text: '', votes: [] }, { _id: 3, text: '', votes: [] }]
	};

	// Method to add an additional choice option
	$scope.addChoice = function() {
		$scope.poll.choices.push({ _id: $scope.poll.choices.length+1, text: '', votes: [] });
	};

	// Validate and save the new poll to the database
	$scope.createPoll = function() {
		var poll = $scope.poll;

		// Check that a question was provided
		if(poll.question.length > 0) {
			var choiceCount = 0;

			// Loop through the choices, make sure at least two provided
			for(var i = 0, ln = poll.choices.length; i < ln; i++) {
				var choice = poll.choices[i];

				if(choice.text.length > 0) {
					choiceCount++
				}
			}

			if(choiceCount > 1) {
				// Create a new poll from the model
				var newPoll = new Poll(poll);

				// Call API to save poll to the database
				newPoll.$save(function(p, resp) {
					if(!p.error) {
						// If there is no error, redirect to the main view
						$location.path('polls');
					} else {
						alert('Could not create poll');
					}
				});
			} else {
				alert('You must enter at least two choices');
			}
		} else {
			alert('You must enter a question');
		}
	};
}
