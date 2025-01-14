const { parseSingle, serialize } = require("@hookun/parse-animation-shorthand");

/**
 * @param {@} options 
 * @returns {import('postcss').Plugin}
 */
module.exports = (options = { debug: false }) => {
  return {
    postcssPlugin: "postcss-nativescript-animations",
    Declaration(decl) {
      // replace animation: *
      // with    animation-*:
      if (decl.prop === "animation") {
		if(decl.value.startsWith("-")){
			decl.value = decl.value.slice(1);
        }
        const styles = parseSingle(decl.value);
        if (styles.duration && Number.isInteger(styles.duration)) {
          styles.duration = `${styles.duration / 1000}s`;
        }
        Object.entries(styles)
          .filter(([, value]) => typeof value === "object")
          .map(([key, value]) => [
            key,
            serialize({ [key]: value }).split(" ")[0],
          ])
          .map(([key, value]) => (styles[key] = value));

        Object.entries(styles)
          .filter(([, value]) => value !== "unset")
          .map(([key, value]) =>
            decl.parent.insertAfter(
              decl,
              decl.clone({
                prop: `animation-${camelToKebab(key)}`,
                value: `${value}`,
              })
            )
          );

        decl.remove();
      }
    },
  };
};
module.exports.postcss = true;

function camelToKebab(input) {
  return input.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
