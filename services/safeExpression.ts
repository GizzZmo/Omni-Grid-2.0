const FUNCTIONS = new Set(['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'abs']);
const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

type Operator = '+' | '-' | '*' | '/' | '^' | 'u-';

interface OperatorMeta {
  precedence: number;
  rightAssociative?: boolean;
  unary?: boolean;
}

const OPERATORS: Record<Operator, OperatorMeta> = {
  '+': { precedence: 1 },
  '-': { precedence: 1 },
  '*': { precedence: 2 },
  '/': { precedence: 2 },
  '^': { precedence: 4, rightAssociative: true },
  'u-': { precedence: 3, rightAssociative: true, unary: true },
};

type Token =
  | { type: 'number'; value: number }
  | { type: 'operator'; value: Operator }
  | { type: 'leftParen' }
  | { type: 'rightParen' }
  | { type: 'function'; value: string };

const normalize = (input: string): string =>
  input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi')
    .replace(/\^/g, '^');

const isDigit = (char: string) => /[0-9]/.test(char);
const isLetter = (char: string) => /[a-z]/.test(char);

const tokenize = (expression: string): Token[] => {
  const tokens: Token[] = [];

  for (let i = 0; i < expression.length; ) {
    const char = expression[i];

    if (isDigit(char) || char === '.') {
      let num = '';
      let dots = 0;
      while (i < expression.length && (isDigit(expression[i]) || expression[i] === '.')) {
        if (expression[i] === '.') dots++;
        if (dots > 1) throw new Error('Invalid number');
        num += expression[i++];
      }
      const parsed = Number(num);
      if (!Number.isFinite(parsed)) throw new Error('Invalid number');
      tokens.push({ type: 'number', value: parsed });
      continue;
    }

    if (isLetter(char)) {
      let identifier = '';
      while (i < expression.length && isLetter(expression[i])) {
        identifier += expression[i++];
      }
      if (identifier in CONSTANTS) {
        tokens.push({ type: 'number', value: CONSTANTS[identifier] });
        continue;
      }
      if (FUNCTIONS.has(identifier)) {
        tokens.push({ type: 'function', value: identifier });
        continue;
      }
      throw new Error(`Unsupported identifier: ${identifier}`);
    }

    if ('+-*/^'.includes(char)) {
      const prev = tokens[tokens.length - 1];
      const unary =
        char === '-' &&
        (!prev || prev.type === 'operator' || prev.type === 'leftParen' || prev.type === 'function');
      tokens.push({ type: 'operator', value: unary ? 'u-' : (char as Operator) });
      i++;
      continue;
    }

    if (char === '(') {
      tokens.push({ type: 'leftParen' });
      i++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'rightParen' });
      i++;
      continue;
    }

    throw new Error(`Unsupported token: ${char}`);
  }

  return tokens;
};

const toRpn = (tokens: Token[]): Token[] => {
  const output: Token[] = [];
  const stack: Token[] = [];

  for (const token of tokens) {
    if (token.type === 'number') {
      output.push(token);
      continue;
    }

    if (token.type === 'function') {
      stack.push(token);
      continue;
    }

    if (token.type === 'operator') {
      const current = OPERATORS[token.value];
      while (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (top.type === 'function') {
          output.push(stack.pop() as Token);
          continue;
        }
        if (top.type !== 'operator') break;
        const meta = OPERATORS[top.value];
        const shouldPop = current.rightAssociative
          ? current.precedence < meta.precedence
          : current.precedence <= meta.precedence;
        if (!shouldPop) break;
        output.push(stack.pop() as Token);
      }
      stack.push(token);
      continue;
    }

    if (token.type === 'leftParen') {
      stack.push(token);
      continue;
    }

    if (token.type === 'rightParen') {
      let hasLeftParen = false;
      while (stack.length > 0) {
        const top = stack.pop() as Token;
        if (top.type === 'leftParen') {
          hasLeftParen = true;
          break;
        }
        output.push(top);
      }
      if (!hasLeftParen) throw new Error('Mismatched parentheses');
      if (stack[stack.length - 1]?.type === 'function') {
        output.push(stack.pop() as Token);
      }
    }
  }

  while (stack.length > 0) {
    const top = stack.pop() as Token;
    if (top.type === 'leftParen' || top.type === 'rightParen') {
      throw new Error('Mismatched parentheses');
    }
    output.push(top);
  }

  return output;
};

const executeFunction = (name: string, arg: number): number => {
  switch (name) {
    case 'sin':
      return Math.sin(arg);
    case 'cos':
      return Math.cos(arg);
    case 'tan':
      return Math.tan(arg);
    case 'log':
      return Math.log10(arg);
    case 'ln':
      return Math.log(arg);
    case 'sqrt':
      return Math.sqrt(arg);
    case 'abs':
      return Math.abs(arg);
    default:
      throw new Error(`Unsupported function: ${name}`);
  }
};

const evaluateRpn = (tokens: Token[]): number => {
  const stack: number[] = [];

  for (const token of tokens) {
    if (token.type === 'number') {
      stack.push(token.value);
      continue;
    }

    if (token.type === 'operator') {
      if (OPERATORS[token.value].unary) {
        const value = stack.pop();
        if (value === undefined) throw new Error('Invalid unary operation');
        stack.push(-value);
        continue;
      }
      const right = stack.pop();
      const left = stack.pop();
      if (left === undefined || right === undefined) throw new Error('Invalid operation');
      switch (token.value) {
        case '+':
          stack.push(left + right);
          break;
        case '-':
          stack.push(left - right);
          break;
        case '*':
          stack.push(left * right);
          break;
        case '/':
          if (right === 0) throw new Error('Division by zero');
          stack.push(left / right);
          break;
        case '^':
          stack.push(left ** right);
          break;
      }
      continue;
    }

    if (token.type === 'function') {
      const value = stack.pop();
      if (value === undefined) throw new Error('Invalid function arguments');
      stack.push(executeFunction(token.value, value));
    }
  }

  if (stack.length !== 1 || !Number.isFinite(stack[0])) {
    throw new Error('Expression could not be evaluated');
  }

  return stack[0];
};

export const evaluateMathExpression = (input: string): number => {
  const normalized = normalize(input);
  if (!normalized) throw new Error('Expression is empty');
  if (normalized.length > 200) throw new Error('Expression is too long');
  const tokens = tokenize(normalized);
  const rpn = toRpn(tokens);
  return evaluateRpn(rpn);
};
