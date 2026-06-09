import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 3000;
const fallbackReactJsTemplate = 'npm create vite@latest sandbox -- --template react';
const rawReactProjectCommand = process.env.REACT_PROJECT_COMMOND?.trim().replace(/^['"]|['"]$/g, '');

export const REACT_PROJECT_COMMOND = !rawReactProjectCommand || rawReactProjectCommand.includes('REACT_PROJECT_COMMOND')
	? fallbackReactJsTemplate
	: rawReactProjectCommand;
