import tseslint from 'typescript-eslint';
export default tseslint.config({ ignores: ['src/wasm/**'] }, ...tseslint.configs.recommended, { rules: { '@typescript-eslint/no-explicit-any': 'off' } });
