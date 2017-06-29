var gulp = require('gulp');
var del = require('del');
var through2 = require('through2');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var concat = require('gulp-concat');


gulp.task('clean', function(cb){
  var stream = del('dist/**/*', cb);
  return stream;
});

gulp.task('uglifycss', function(){
  return gulp.src('src/cropper.css')
      .pipe(uglifycss())
      .pipe(concat('cropper.min.css'))
      .pipe(gulp.dest('dist/'));
});

gulp.task('uglifyjs', ['uglifycss'], function(){
  return gulp.src(['src/**/*.min.js', 'src/exif.js'])
      .pipe(uglify())
      .pipe(modify(version))
      .pipe(gulp.dest('dist/'));
});

gulp.task('exit', ['uglifyjs'], function(){
  process.exit();
});


function modify(modifier){
  return through2.obj(function(file, encoding, done){
    var content = modifier(String(file.contents));
    file.contents = new Buffer(content);
    this.push(file);
    done();
  });
}

function version(data){
  return data.replace(/\"use strict\";require\(\"\.\/cropper\.css\"\),/, '!');
}


gulp.task('default', ['clean', 'uglifycss', 'uglifyjs', 'exit']);