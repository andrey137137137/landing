var ToTop = function()
{
	'use strict';

	function Construct(params)
	{
		if ( !(this instanceof Construct) )
		{
			return new Construct(params);
		}
		
		this.init.apply(this, params);
	}

	Construct.prototype = Object.create(ReasanikBase());

	// Construct.prototype = {

		Construct.prototype.constructor = Construct;

		Construct.prototype.pluginName = 'ToTop';

		Construct.prototype.init = function(params)
		{
			var self = this;

			params = this.extend(
				{
					buttonID: false,
					border: 300,
					defaultScrollStep: 70
				},
				params
			);

			if (!params.buttonID)
			{
				this.setErrorMessage(this.pluginName);
				return false;
			}

			this.border = params.border;

			this.elem = document.getElementById(params.buttonID);
			this.socialsContainer = document.getElementById('footer-socials-container');

			// this.ToTopButton = new ScrollEffect.Construct({
			// 	buttonID: params.buttonID,
			// 	direction: -1,
			// 	defaultScrollStep: 70
			// });

			this.ToTopButton = ScrollEffect({
				buttonID: params.buttonID,
				defaultScrollStep: params.defaultScrollStep,
				direction: -1
			});

	    params = null;

			window.addEventListener('scroll', function(){
				self.showHideToTop();
			});

			this.showHideToTop();
		};

		Construct.prototype.showHideToTop = function()
		{
			var self = this;
			// var endPage = document.documentElement.scrollHeight - window.innerHeight;
			var endPage = this.getScrollHeight() - window.innerHeight;

			this.ToTopButton.scrollY = this.getScrollY();

			if (this.ToTopButton.scrollY > this.border)
			{
				this.elem.classList.add('active');
			}
			else
			{
				this.elem.classList.remove('active');
			}

			if (parseInt(this.ToTopButton.scrollY) === endPage)
			{
				setTimeout(
					function(){
						self.elem.classList.add('finally');
					},
					200
				);

				this.socialsContainer.classList.add('visible');
			}
			else
			{
				this.elem.classList.remove('finally');
				this.socialsContainer.classList.remove('visible');
			}
		};
	// };

	return Construct(arguments);
};