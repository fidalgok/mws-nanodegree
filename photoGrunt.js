/*
 After you have changed any settings for the responsive_images task,
 run this with one of these options:
  "grunt" alone creates a new, completed images directory
  "grunt clean" removes the images directory
  "grunt responsive_images" re-processes images without removing the old ones
*/

module.exports = function(grunt) {
  grunt.initConfig({
    responsive_images: {
      dev: {
        options: {
          engine: 'im',
          sizes: [
            {
              width: 480,
              suffix: '-sm-1x',
              quality: 60
            },
            {
              width: 960,
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
            cwd: 'images_src/',
            dest: 'images/'
          }
        ]
      }
    },

    /* Clear out the images directory if it exists */
    clean: {
      dev: {
        src: ['images']
      }
    },

    /* Generate the images directory if it is missing */
    mkdir: {
      dev: {
        options: {
          create: ['images']
        }
      }
    },

    /* Copy the "fixed" images that don't go through processing into the images/directory */
    copy: {
      dev: {
        files: [
          {
            expand: true,
            src: ['images_src/fixed/*.{gif,jpg,png}'],
            dest: 'images/',
            flatten: true
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.registerTask('default', [
    'clean',
    'mkdir',
    'copy',
    'responsive_images'
  ]);
};
