(function(){

	var Translator;

	var TEST_LOCALES = '../examples/client/locales/test.json';
	var TEST_LOCALES_2 = '../examples/client/locales/test_2.json';
	var TEST_LOCALES_3 = '../examples/client/locales/test_3.json';

	var DEBUG = false;

	var resetTranslations = function(){
		Translator.reset();
	};

	describe('Loading Locales', function(){

		it('should load locales from a url', function(done){
			Translator = new Lingual(TEST_LOCALES, {debug: DEBUG}, function(){
				expect( $('#t-1').text() ).to.equal( 'bar' );
				expect( $('#t-2').text() ).to.equal( 'world' );

				resetTranslations();
				done();
			})
		});

		it('should load locales from multiple urls', function(done){
			Translator = new Lingual([TEST_LOCALES, TEST_LOCALES_2], {debug: DEBUG}, function(){
				expect( $('#t-1').text() ).to.equal( 'bar' );
				expect( $('#t-2').text() ).to.equal( 'world' );
				expect( $('#t-3').text() ).to.equal( 'Sample' );
				expect( $('#t-4').text() ).to.equal( 'Test' );

				resetTranslations();
				done();
			})
		});

		it('should load locales added at a later point', function(done){
			Translator = new Lingual([TEST_LOCALES, TEST_LOCALES_2], {debug: DEBUG}, function(){
				expect( $('#t-1').text() ).to.equal( 'bar' );
				expect( $('#t-2').text() ).to.equal( 'world' );

				new Lingual([TEST_LOCALES, TEST_LOCALES_2], {debug: DEBUG}, function(){
					expect( $('#t-3').text() ).to.equal( 'Sample' );
					expect( $('#t-4').text() ).to.equal( 'Test' );

					resetTranslations();
					done();
				})
			})
		});

	});

	describe('Changing Language', function(){

		it('should change locales', function(done){
			Translator = new Lingual(TEST_LOCALES, {debug: DEBUG}, function(){

				Translator.locale('caps');
				Translator.translate();

				expect( $('#t-1').text() ).to.equal( 'BAR' );
				expect( $('#t-2').text() ).to.equal( 'WORLD' );

				resetTranslations();
				done();
			})
		})

		it('should fallback to specified locale', function(done){
			Translator = new Lingual(TEST_LOCALES, {lang: 'invalid', debug: DEBUG}, function(){

				expect( $('#t-1').text() ).to.equal( 'bar' );
				expect( $('#t-2').text() ).to.equal( 'world' );

				resetTranslations();
				done();
			})
		})

		it('should fallback to any available locale', function(done){
			Translator = new Lingual(TEST_LOCALES_3, {lang: 'invalid', debug: DEBUG}, function(){

				expect( Translator.locale() ).to.equal( "some-lang" );

				resetTranslations();
				done();
			})
		})

	});

	describe('Translating', function(){

		it('should return translation from gettext', function(done){
			Translator = new Lingual(TEST_LOCALES, {debug: DEBUG}, function(){
				expect( Translator.gettext('foo') ).to.equal( "bar" );
				expect( Translator.gettext('say-hi', {name: 'Jacob'}) ).to.equal( "Hello, Jacob!" );

				resetTranslations();
				done();
			})
		});

		it('should translate attributes', function(done){
			Translator = new Lingual(TEST_LOCALES, {debug: DEBUG}, function(){

				expect( $('#t-5').attr('placeholder') ).to.equal( 'bar' );
				expect( $('#t-6').attr('value') ).to.equal( 'world' );

				resetTranslations();
				done();
			})
		});

		it('should fallback to any available language', function(done){
			window.Translator = new Lingual(TEST_LOCALES, {lang: 'caps', debug: DEBUG}, function(){

				expect( $('#t-7').text() ).to.equal( 'I only exist in English' );

				resetTranslations();
				done();
			})
		});

	});

	describe('Resetting', function(){
		it('should reset translations', function(done){
			Translator = new Lingual(TEST_LOCALES, {debug: DEBUG}, function(){
				expect( $('#t-1').text() ).to.equal( 'bar' );
				expect( $('#t-2').text() ).to.equal( 'world' );

				resetTranslations();

				expect( $('#t-1').text() ).to.equal( '' );
				expect( $('#t-2').text() ).to.equal( '' );

				done();
			})
		});
	});


})();

