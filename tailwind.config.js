module.exports = {
    content: ['./index.html', './script.js', './gallery-booth.js'],
    theme: {
        extend: {
            colors: {
                // Mocca/Chocolate brown palette
                'choco-100': '#f7e8e1', // very light warm
                'choco-200': '#dfc2b5', // light warm
                'choco-300': '#c69b88', // soft neutral-warm
                'choco-400': '#ae735f', // medium warm
                'choco-500': '#964c37', // main warm brown
                'choco-600': '#7e2d1e', // deep brown
                'choco-700': '#651d13', // darker accent
                'choco-900': '#3f120a', // near-black brown
                // accent neutrals often used in wedding designs
                'cream-1': '#f8f3ed', // soft ivory
                'cream-2': '#efe8e0', // slightly darker ivory
                'cream-3': '#e8e0d5', // pale beige
                'grey-1': '#ece9e4', // very light neutral gray
                'grey-2': '#c4c0b9', // medium neutral gray
            }
        }
    },
    plugins: []
}
