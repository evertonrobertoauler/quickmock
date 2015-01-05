(function () {

	angular.module('QuickMockDemo', [])

		.service('APIService', ['$http', function($http){
			var api_url = 'http://api.someurl.com';
			return {
				get: function(url){
					return $http.get(api_url + url);
				},
				put: function(url){
					return $http.put(api_url + url);
				},
				post: function(url){
					return $http.post(api_url + url);
				},
				delete: function(url){
					return $http.delete(api_url + url);
				}
			};
		}])

		.value('InvalidUserFormMessages', {
			emailInvalid: 'Please provide a valid email address',
			passwordLength: 'Password must be at least 8 characters in length.',
			passwordInvalid: 'Passwords can only contain letters, numbers, underscores (_) and dashes (-).',
			passwordsDontMatch: 'Passwords do not match.',
			urlInvalid: 'Website URL must be valid. Please check it and try again.'
		})

		.value('UserRegex', {
			password: /^[a-zA-Z0-9_-]{6,18}$/,
			email: /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,
			url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
		})

		.factory('UserFormValidator', ['InvalidUserFormMessages', 'UserRegex', function(msg, regex){
			return function(user){
				var response = {isValid: false, messages: []};
				if(!user || angular.equals(user, {})) return response;
				if(!user.email || !user.email.length || !user.email.match(regex.email)){
					response.messages.push(msg.emailInvalid);
				}
				if(!user.password || !user.password.length || user.password.length < 8){
					response.messages.push(msg.passwordLength);
				}
				if(!user.password.match(regex.password)){
					response.messages.push(msg.passwordInvalid);
				}
				if(user.password !== user.passwordConfirm){
					response.messages.push(msg.passwordsDontMatch);
				}
				if(user.website && !user.website.match(regex.url)){
					response.messages.push(msg.urlInvalid);
				}
				response.isValid = !response.messages.length;
				return response;
			};
		}])

		.value('NotificationTitles', {
			error: 'It looks like something went wrong...',
			success: 'Congraduations!',
			warning: 'Be careful...',
			basic: 'Check this out!',
			confirm: 'Confirm Action'
		})

		.service('NotificationService', ['$window', 'NotificationTitles', function($window, titles){
			return {
				error: function(msg){
					$window.alert(titles.error + '\n\n' + msg);
				},
				success: function(msg){
					$window.alert(titles.success + '\n\n' + msg);
				},
				warning: function(msg){
					$window.alert(titles.warning + '\n\n' + msg);
				},
				basic: function(msg){
					$window.alert(titles.basic + '\n\n' + msg);
				},
				confirm: function(msg){
					return $window.confirm(titles.confirm + '\n\n' + msg);
				}
			};
		}])

		.controller('FormController', ['$scope', 'APIService', 'UserFormValidator', 'NotificationService',
			function($scope, APIService, UserFormValidator, NotificationService){

				$scope.user = null;
				$scope.edit = false;

				APIService.get('/user/me').then(function(data){
					$scope.user = data;
				});

				$scope.toggleEditUser = function(){
					$scope.edit = !$scope.edit;
				};

				$scope.saveUser = function(){
					var user = $scope.user,
						verify = UserFormValidator(user);
					if(verify.isValid){
						APIService.put('/user/me').then(function(){
							NotificationService.success('User was saved successfully');
						})
					}else{
						angular.forEach(verify.messages, function(msg){
							NotificationService.error(msg);
						});
					}
				}

			}
		])

		.directive('zbToggle', ['NotificationService', function(NotificationService){
			return {
				restrict: 'AE',
				replace: true,
				transclude: true,
				template: '<div class="toggle" ng-click="check = !check">'
					+ '<input type="checkbox" ng-model="check">'
					+ '<span ng-transclude></span>'
					+ '</div>',
				link: function(scope, elem, attrs){

					var notificationMessage = 'Your preference has been set to: ';

					scope.check = false;

					scope.$watch('check', function(val){
						console.log('check watch called', val);
						NotificationService[val ? 'success' : 'warning'](notificationMessage + val);
					});

				}
			};
		}])

})();