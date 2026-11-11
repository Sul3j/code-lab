import {
  Terminal, GitBranch, Repeat, Rows3, SquareFunction, Grid3x3, Type, MemoryStick, Boxes,
  FileCode2, Box, Calculator, ArrowLeftRight, Bug, BookOpen, ListOrdered, MousePointer2, Cpu,
  Link2, Layers, RefreshCw, Quote, Package, Combine, Infinity as InfinityIcon, Copy, Zap, Sigma,
  CaseSensitive, Keyboard, Shapes, Shuffle, Puzzle, Plus, Lock, Hash, Hammer, GitFork,
} from 'lucide-react';

const MAP = {
  Terminal, GitBranch, Repeat, Rows3, FunctionSquare: SquareFunction, Grid3x3, Type, MemoryStick, Boxes,
  FileCode2, Box, Calculator, ArrowLeftRight, Bug, ListOrdered, MousePointer2, Cpu, Link2, Layers,
  RefreshCw, Quote, Package, Combine, Infinity: InfinityIcon, Copy, Zap, Sigma, CaseSensitive, Keyboard, Shapes,
  Shuffle, Puzzle, Plus, Lock, Hash, Hammer, GitFork,
};

export function iconFor(name) {
  return MAP[name] || BookOpen;
}
