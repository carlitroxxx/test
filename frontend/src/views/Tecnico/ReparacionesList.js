import React, { useState } from 'react';
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Paper,
    TextField,
    InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const ReparacionesList = () => {
    // Datos de ejemplo para el frontend
    const initialReparaciones = [
        {
            id: 1,
            rut: '12.345.678-9',
            fecha: '15-06-2023',
            hora: '10:30',
            tipo: 'Ajuste de frenos',
            telefono: '912345678',
            estado: 'En espera',
            descripcion: 'Los frenos delanteros no responden adecuadamente y hacen ruido al frenar.'
        },
        {
            id: 2,
            rut: '98.765.432-1',
            fecha: '16-06-2023',
            hora: '14:00',
            tipo: 'Cambio de cadena',
            telefono: '987654321',
            estado: 'Recibida',
            descripcion: 'La cadena se salta en ciertos cambios. Necesita reemplazo completo.'
        },
        {
            id: 3,
            rut: '11.222.333-4',
            fecha: '17-06-2023',
            hora: '11:15',
            tipo: 'Reparación de pinchazo',
            telefono: '911222333',
            estado: 'En proceso',
            descripcion: 'Rueda trasera con pinchazo. Necesita parche o posible reemplazo de cámara.'
        }
    ];

    const [reparaciones, setReparaciones] = useState(initialReparaciones);
    const [selectedReparacion, setSelectedReparacion] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [tempEstado, setTempEstado] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Filtrar reparaciones por RUT
    const filteredReparaciones = searchTerm
        ? initialReparaciones.filter(r =>
            r.rut.toLowerCase().includes(searchTerm.toLowerCase()))
        : initialReparaciones;

    const handleOpenDialog = (reparacion) => {
        setSelectedReparacion(reparacion);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleEstadoChange = (event, reparacion) => {
        setSelectedReparacion(reparacion);
        setTempEstado(event.target.value);
        setConfirmationOpen(true);
    };

    const confirmEstadoChange = () => {
        if (selectedReparacion && tempEstado) {
            const updatedReparaciones = initialReparaciones.map(r =>
                r.id === selectedReparacion.id ? {...r, estado: tempEstado} : r
            );
            setReparaciones(updatedReparaciones);

            // Actualizar también la reparación seleccionada en el popup
            setSelectedReparacion({...selectedReparacion, estado: tempEstado});
        }
        setConfirmationOpen(false);
        setTempEstado('');
    };

    const cancelEstadoChange = () => {
        setConfirmationOpen(false);
        setTempEstado('');
    };

    const getEstadoColor = (estado) => {
        switch(estado) {
            case 'En espera': return 'warning.main';
            case 'Recibida': return 'info.main';
            case 'En proceso': return 'secondary.main';
            case 'Finalizada': return 'success.main';
            case 'Cancelada':
            case 'No reparada':
                return 'error.main';
            default: return 'text.primary';
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
                Reparaciones Programadas
            </Typography>

            {/* Campo de búsqueda */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Buscar por RUT"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'background.paper',
                        }
                    }}
                />
            </Box>

            <Paper elevation={3} sx={{ overflowX: 'auto' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white', py: 1 }}>RUT</TableCell>
                            <TableCell sx={{ color: 'white', py: 1 }}>FECHA</TableCell>
                            <TableCell sx={{ color: 'white', py: 1 }}>HORA</TableCell>
                            <TableCell sx={{ color: 'white', py: 1 }}>TIPO REPARACIÓN</TableCell>
                            <TableCell sx={{ color: 'white', py: 1 }}>TELÉFONO</TableCell>
                            <TableCell sx={{ color: 'white', py: 1 }}>ESTADO</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredReparaciones.map((r) => (
                            <TableRow
                                key={r.id}
                                hover
                                onClick={(e) => {
                                    // Solo abre el diálogo si el click no fue en el Select
                                    if (!e.target.closest('.MuiSelect-select')) {
                                        handleOpenDialog(r);
                                    }
                                }}
                                sx={{
                                    cursor: 'pointer',
                                    '& .MuiTableCell-root': {
                                        py: 1
                                    }
                                }}
                            >
                                <TableCell>{r.rut}</TableCell>
                                <TableCell>{r.fecha}</TableCell>
                                <TableCell>{r.hora}</TableCell>
                                <TableCell>{r.tipo}</TableCell>
                                <TableCell>{r.telefono}</TableCell>
                                <TableCell>
                                    <Select
                                        value={r.estado}
                                        onChange={(e) => handleEstadoChange(e, r)}
                                        onClick={(e) => e.stopPropagation()}
                                        sx={{
                                            color: getEstadoColor(r.estado),
                                            minWidth: 120,
                                            height: 32,
                                            '& .MuiSelect-select': {
                                                py: 1
                                            },
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: getEstadoColor(r.estado)
                                            }
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    maxHeight: 200
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem value="En espera">En espera</MenuItem>
                                        <MenuItem value="Recibida">Recibida</MenuItem>
                                        <MenuItem value="En proceso">En proceso</MenuItem>
                                        <MenuItem value="Finalizada">Finalizada</MenuItem>
                                        <MenuItem value="Cancelada">Cancelada</MenuItem>
                                        <MenuItem value="No reparada">No reparada</MenuItem>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            {/* Diálogo de detalles */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>Detalles de la Reparación</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            <strong>RUT:</strong> {selectedReparacion?.rut} |
                            <strong> FECHA:</strong> {selectedReparacion?.fecha} |
                            <strong> HORA:</strong> {selectedReparacion?.hora}
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            <strong>TIPO REPARACIÓN:</strong>
                        </Typography>
                        <Typography>{selectedReparacion?.tipo}</Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            <strong>DESCRIPCIÓN DETALLADA:</strong>
                        </Typography>
                        <Typography>{selectedReparacion?.descripcion}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle1">
                            <strong>TELÉFONO:</strong> {selectedReparacion?.telefono}
                        </Typography>
                        <Select
                            value={selectedReparacion?.estado || ''}
                            onChange={(e) => {
                                setTempEstado(e.target.value);
                                setConfirmationOpen(true);
                            }}
                            sx={{
                                color: getEstadoColor(selectedReparacion?.estado),
                                minWidth: 120,
                                height: 32,
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: getEstadoColor(selectedReparacion?.estado)
                                }
                            }}
                        >
                            <MenuItem value="En espera">En espera</MenuItem>
                            <MenuItem value="Recibida">Recibida</MenuItem>
                            <MenuItem value="En proceso">En proceso</MenuItem>
                            <MenuItem value="Finalizada">Finalizada</MenuItem>
                            <MenuItem value="Cancelada">Cancelada</MenuItem>
                            <MenuItem value="No reparada">No reparada</MenuItem>
                        </Select>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de confirmación */}
            <Dialog open={confirmationOpen} onClose={cancelEstadoChange}>
                <DialogTitle>Confirmar cambio de estado</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Estás seguro que deseas cambiar el estado a "{tempEstado}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelEstadoChange}>Cancelar</Button>
                    <Button onClick={confirmEstadoChange} color="primary">Confirmar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReparacionesList;