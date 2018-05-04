module.exports = function(grunt) {
  grunt.initConfig({
    //process images
    responsive_images: {
      dev: {
        options: {
          engine: 'im',
          sizes: [
            {
              width: 300,
              suffix: '-sm-1x',
              quality: 60
            },
            {
              width: 600,
              suffix: '-sm-2x',
              quality: 60
            },
            {
              width: 960,
              suffix: '-md-1x',
              quality: 60
            },
            {
              width: 1920,
              suffix: '-md-2x',
              quality: 60
            }
          ]
        },
        files: [
          {
            expand: true,
            src: ['*.{gif,jpg,png}'],
            cwd: 'src_img/',
            dest: 'images/'
          }
        ]
      }
    },
    //clean images folder
    clean: {
      dev: {
        src: ['images']
      }
    },
    //make images folder if it doesn't exist
    mkdir: {
      dev: {
        options: {
          create: ['images']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.registerTask('default', ['clean', 'mkdir', 'responsive_images']);
};
