import * as React from 'react';
import { screen, render, waitFor, fireEvent } from '@testing-library/react';
import expect from 'expect';
import {
    CoreAdminContext,
    ListBase,
    ResourceContextProvider,
    testDataProvider,
} from 'ra-core';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { BulkUpdateWithConfirmButton } from './BulkUpdateWithConfirmButton';
import { Datagrid } from '../list';
import { TextField } from '../field';

const theme = createTheme();

describe('<BulkUpdateWithConfirmButton />', () => {
    it('should close the confirmation dialog after confirm', async () => {
        const record = { id: 123, title: 'lorem' };
        const dataProvider = testDataProvider({
            getList: () => Promise.resolve({ data: [record], total: 1 }),
            getMany: () => Promise.resolve({ data: [record] }),
            getOne: () => Promise.resolve({ data: record }),
            updateMany: p => {
                record.title = p.data.title;
                return p.ids;
            },
        });
        const ActionButtons = () => (
            <>
                <BulkUpdateWithConfirmButton
                    data={{ views: 'foobar' }}
                    mutationMode="pessimistic"
                />
            </>
        );
        render(
            <ThemeProvider theme={theme}>
                <CoreAdminContext dataProvider={dataProvider}>
                    <ResourceContextProvider value="posts">
                        <ListBase value={{ selectedIds: [123] }}>
                            <Datagrid bulkActionButtons={<ActionButtons />}>
                                <TextField source="title" />
                            </Datagrid>
                        </ListBase>
                    </ResourceContextProvider>
                </CoreAdminContext>
            </ThemeProvider>
        );
        expect(await screen.findByText('lorem')).toBeDefined();
        const checkContainer = await screen.findByRole('columnheader', {
            name: 'Select all',
        });
        const check = within(checkContainer).getByRole('checkbox');
        fireEvent.click(check);
        expect(check).toBeChecked();

        fireEvent.click(screen.getByLabelText('ra.action.update'));
        expect(await screen.findByText('Update 1 posts')).toBeDefined();
        fireEvent.click(screen.getByText('ra.action.confirm'));

        await waitFor(() => {
            expect(screen.queryByText('Update 1 posts')).toBeNull();
        });
        expect(screen.getByText('foobar')).toBeDefined();
    });
});
