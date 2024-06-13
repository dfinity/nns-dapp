" Sorts imports in the current Svelte file.
" First it joins all the lines that are part of the same import statement.
" Then it modifies the lines by putting a copy of the path at the front of the line.
" Then it sorts the lines.
" Then it removes the path from the front of the line.
" It does this separately for each contiguous block of import statements.
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
    let l:first_import = search('^\s*import', 'W')
    if first_import == 0
      break
    endif
    let l:last_import = search('\v^(\s*import\s)@!', 'W') - 1
    let l:range = first_import . ',' . last_import
    " Put a copy of the path at the front of the line
    execute range . 's@^\s*import\s\+.*\s*from\s*"\([^"]*\)"\s*;\s*$@\1' . path_import_separator . '&@'
    " Sort the lines based on the path
    execute range . '!sort'
    " Remove the path from the front of the line
    execute range 's@.*' . path_import_separator . '@@'
  endwhile
endfunction
