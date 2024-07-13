" Sorts imports in the current Svelte file.
" First it joins all the lines that are part of the same import statement.
" Then it modifies the lines by putting a copy of the path at the front of the line.
" Then it sorts the lines.
" Then it removes the path from the front of the line.
" It does this separately for each contiguous block of import statements.
"
" To use this in Vim, you can add the following to your .vimrc to make
" the 'gs' keyboard shortcut sort the imports in a Svelte file:
" autocmd FileType svelte nnoremap gs :silent call SortSvelteImports()<CR>
function! SortSvelteImports()
  let l:path_import_separator = ' #### path import separator #### '
  let l:old_lines = line('$')
  " Join all the lines that are part of the same import statement
  while 1
    silent! execute '%g/^\s*import\s\+.*[^;]$/normal J'
    let l:new_lines = line('$')
    if l:new_lines == l:old_lines
      break
    endif
    let l:old_lines = l:new_lines
  endwhile
  " Jump to the first line
  1
  while 1
    let l:first_import = search('^\s*import\s\+.*\s\+from\s*"', 'W')
    if first_import == 0
      break
    endif
    let l:last_import = search('\v^(\s*import\s)@!', 'W') - 1
    let l:range = first_import . ',' . last_import
    " Put a copy of the path at the front of the line
    execute range . 's@^\s*import\s\+.*\s\+from\s*"\([^"]*\)"\s*;\s*$@\1' . path_import_separator . '&@'
    " Sort the lines based on the path
    execute range . '!sort'
    " Remove the path from the front of the line
    execute range 's@.*' . path_import_separator . '@@'
  endwhile
  1
  while 1
    " Find imports that import multiple things
    let l:import_start = search('^\s*import\s\+\(type\s\+\)\?{.*,.*}', 'W')
    if import_start == 0
      break
    endif
    let import_start += 1
    " Put the imported things on separate lines
    s@{\s*@{\r    @
    s@,\s*\(\w\)@,\r    \1@g
    s@,\?\s*}@,\r  }@
    let l:import_end = line('.') - 1
    let l:range = import_start . ',' . import_end
    " Put ~ in front of type-only imports so they sort last
    silent! execute range . 's@\<type\>@\~type@'
    " Sort the things imported by this import statement
    execute range . '!sort'
    " Remove the added ~ in front of type-only imports
    silent! execute range . 's@\~type\>@type@'
  endwhile
endfunction
