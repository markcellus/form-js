let transform = [
    [
        "babelify",
        {
            "presets": [
                "es2015"
            ],
            "plugins": [
                "add-module-exports" // to ensure dist files are exported without the "default" property
            ]
        }
    ]
];

module.exports = {
    build: {
        files: {
            'dist/form.js': ['src/form.js']
        },
        browserifyOptions: {
            standalone: 'Form',
            transform,
        },
        minifyFiles: {
            'dist/form-min.js': ['dist/form.js']
        },
        bannerFiles: ['dist/*']
    },
    tests: {
        qunit: {
            files: ['tests/*.js']
        }
    }
};
