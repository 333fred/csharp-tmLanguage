/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { should } from 'chai';
import { tokenize, Input, Token } from './utils/tokenize';

describe("Locals", () => {
    before(() => { should(); });

    describe("Local variables", () => {
        it("declaration", async () => {
            const input = Input.InMethod(`int x;`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.PrimitiveType.Int,
                Token.Identifiers.LocalName("x"),
                Token.Punctuation.Semicolon
            ]);
        });

        it("declaration with initializer", async () => {
            const input = Input.InMethod(`int x = 42;`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.PrimitiveType.Int,
                Token.Identifiers.LocalName("x"),
                Token.Operators.Assignment,
                Token.Literals.Numeric.Decimal("42"),
                Token.Punctuation.Semicolon
            ]);
        });

        it("multiple declarators", async () => {
            const input = Input.InMethod(`nint x, y;`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.PrimitiveType.Nint,
                Token.Identifiers.LocalName("x"),
                Token.Punctuation.Comma,
                Token.Identifiers.LocalName("y"),
                Token.Punctuation.Semicolon
            ]);
        });

        it("multiple declarators with initializers", async () => {
            const input = Input.InMethod(`int x = 19, y = 23;`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.PrimitiveType.Int,
                Token.Identifiers.LocalName("x"),
                Token.Operators.Assignment,
                Token.Literals.Numeric.Decimal("19"),
                Token.Punctuation.Comma,
                Token.Identifiers.LocalName("y"),
                Token.Operators.Assignment,
                Token.Literals.Numeric.Decimal("23"),
                Token.Punctuation.Semicolon
            ]);
        });

        it("const declaration", async () => {
            const input = Input.InMethod(`const int x = 42;`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.Keyword.Modifier.Const,
                Token.PrimitiveType.Int,
                Token.Identifiers.LocalName("x"),
                Token.Operators.Assignment,
                Token.Literals.Numeric.Decimal("42"),
                Token.Punctuation.Semicolon
            ]);
        });

        it("const with multiple declarators", async () => {
            const input = Input.InMethod(`const int x = 19, y = 23;`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.Keyword.Modifier.Const,
                Token.PrimitiveType.Int,
                Token.Identifiers.LocalName("x"),
                Token.Operators.Assignment,
                Token.Literals.Numeric.Decimal("19"),
                Token.Punctuation.Comma,
                Token.Identifiers.LocalName("y"),
                Token.Operators.Assignment,
                Token.Literals.Numeric.Decimal("23"),
                Token.Punctuation.Semicolon
            ]);
        });

        it("ref local", async () => {
            const input = Input.InMethod(`ref int x;`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.Keyword.Modifier.Ref,
                Token.PrimitiveType.Int,
                Token.Identifiers.LocalName("x"),
                Token.Punctuation.Semicolon
            ]);
        });

        it("ref readonly local", async () => {
            const input = Input.InMethod(`ref readonly int x;`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.Keyword.Modifier.Ref,
                Token.Keyword.Modifier.ReadOnly,
                Token.PrimitiveType.Int,
                Token.Identifiers.LocalName("x"),
                Token.Punctuation.Semicolon
            ]);
        });

        it("ref local with initializer", async () => {
            const input = Input.InMethod(`ref int x = ref y;`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.Keyword.Modifier.Ref,
                Token.PrimitiveType.Int,
                Token.Identifiers.LocalName("x"),
                Token.Operators.Assignment,
                Token.Keyword.Modifier.Ref,
                Token.Variables.ReadWrite("y"),
                Token.Punctuation.Semicolon
            ]);
        });

        it("ref readonly local with initializer", async () => {
            const input = Input.InMethod(`ref readonly int x = ref y;`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.Keyword.Modifier.Ref,
                Token.Keyword.Modifier.ReadOnly,
                Token.PrimitiveType.Int,
                Token.Identifiers.LocalName("x"),
                Token.Operators.Assignment,
                Token.Keyword.Modifier.Ref,
                Token.Variables.ReadWrite("y"),
                Token.Punctuation.Semicolon
            ]);
        });

        it("ref readonly local var with initializer", async () => {
            const input = Input.InMethod(`ref readonly var x = ref y;`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.Keyword.Modifier.Ref,
                Token.Keyword.Modifier.ReadOnly,
                Token.Keyword.Definition.Var,
                Token.Identifiers.LocalName("x"),
                Token.Operators.Assignment,
                Token.Keyword.Modifier.Ref,
                Token.Variables.ReadWrite("y"),
                Token.Punctuation.Semicolon
            ]);
        });
    });

    describe("Local functions", () => {
        it("local function declaration with arrow body", async () => {
            const input = Input.InMethod(`nuint Add(nuint x, uint y) => x + y;`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.PrimitiveType.Nuint,
                Token.Identifiers.MethodName("Add"),
                Token.Punctuation.OpenParen,
                Token.PrimitiveType.Nuint,
                Token.Identifiers.ParameterName("x"),
                Token.Punctuation.Comma,
                Token.PrimitiveType.UInt,
                Token.Identifiers.ParameterName("y"),
                Token.Punctuation.CloseParen,
                Token.Operators.Arrow,
                Token.Variables.ReadWrite("x"),
                Token.Operators.Arithmetic.Addition,
                Token.Variables.ReadWrite("y"),
                Token.Punctuation.Semicolon
            ]);
        });

        it("local function declaration with block definition", async () => {
            const input = Input.InMethod(`
int Add(int x, int y)
{
    return x + y;
}`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.PrimitiveType.Int,
                Token.Identifiers.MethodName("Add"),
                Token.Punctuation.OpenParen,
                Token.PrimitiveType.Int,
                Token.Identifiers.ParameterName("x"),
                Token.Punctuation.Comma,
                Token.PrimitiveType.Int,
                Token.Identifiers.ParameterName("y"),
                Token.Punctuation.CloseParen,
                Token.Punctuation.OpenBrace,
                Token.Keyword.Flow.Return,
                Token.Variables.ReadWrite("x"),
                Token.Operators.Arithmetic.Addition,
                Token.Variables.ReadWrite("y"),
                Token.Punctuation.Semicolon,
                Token.Punctuation.CloseBrace
            ]);
        });

        it("local function declaration with async modifier", async () => {
            const input = Input.InMethod(`async void Foo() { }`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.Keyword.Modifier.Async,
                Token.PrimitiveType.Void,
                Token.Identifiers.MethodName("Foo"),
                Token.Punctuation.OpenParen,
                Token.Punctuation.CloseParen,
                Token.Punctuation.OpenBrace,
                Token.Punctuation.CloseBrace
            ]);
        });

        it("local function declaration with unsafe modifier", async () => {
            const input = Input.InMethod(`unsafe void Foo() { }`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.Keyword.Modifier.Unsafe,
                Token.PrimitiveType.Void,
                Token.Identifiers.MethodName("Foo"),
                Token.Punctuation.OpenParen,
                Token.Punctuation.CloseParen,
                Token.Punctuation.OpenBrace,
                Token.Punctuation.CloseBrace
            ]);
        });

        it("local function declaration with static modifier", async () => {
            const input = Input.InMethod(`static void Foo() { }`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.Keyword.Modifier.Static,
                Token.PrimitiveType.Void,
                Token.Identifiers.MethodName("Foo"),
                Token.Punctuation.OpenParen,
                Token.Punctuation.CloseParen,
                Token.Punctuation.OpenBrace,
                Token.Punctuation.CloseBrace
            ]);
        });

        it("local function declaration with extern modifier", async () => {
            const input = Input.InMethod(`extern static void Foo() { }`);
            const tokens = await tokenize(input);

            tokens.should.deep.equal([
                Token.Keyword.Modifier.Extern,
                Token.Keyword.Modifier.Static,
                Token.PrimitiveType.Void,
                Token.Identifiers.MethodName("Foo"),
                Token.Punctuation.OpenParen,
                Token.Punctuation.CloseParen,
                Token.Punctuation.OpenBrace,
                Token.Punctuation.CloseBrace
            ]);
        });
    });
});